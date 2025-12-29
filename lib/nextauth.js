import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import env from "./env";
import {
  syncCustomerToWoo,
  findCustomerByEmail,
  updateCustomerById,
} from "./woo";

export function generatePassword(length = 20) {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=";
  let out = "";
  for (let i = 0; i < length; i++)
    out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export const authOptions = {
  providers: [
    // CREDENTIALS PROVIDER (WordPress JWT / internal login)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email;

        // 1️⃣ Check Woo customer meta to see if this is a Google-only account
        let existingCustomer = null;
        try {
          existingCustomer = await findCustomerByEmail(email);
        } catch (e) {
          console.warn("findCustomerByEmail failed in authorize", e);
        }

        if (existingCustomer?.meta_data) {
          const providerMeta = existingCustomer.meta_data.find(
            (m) => m.key === "auth_provider"
          );
          if (providerMeta?.value === "google") {
            // ❌ Block password login for Google-linked accounts
            throw new Error(
              "This account uses Google sign-in. Please sign in with Google."
            );
          }
        }

        // 2️⃣ Proceed with your existing WP_JWT_URL / internal login logic
        let res;
        try {
          if (env.WP_JWT_URL) {
            res = await fetch(env.WP_JWT_URL, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              cache: "no-store",
              body: JSON.stringify({
                username: credentials.email,
                password: credentials.password,
              }),
            });
          } else {
            // Fallback to internal login route so WP_JWT_URL is optional
            const internalUrl = `${env.NEXTAUTH_URL.replace(
              /\/$/,
              ""
            )}/api/auth/login`;
            res = await fetch(internalUrl, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              cache: "no-store",
              body: JSON.stringify({
                username: credentials.email,
                password: credentials.password,
              }),
            });
          }
        } catch (e) {
          console.error("authorize fetch error", e);
          return null;
        }

        if (!res.ok) {
          try {
            const errBody = await res.json().catch(() => null);
            console.error("authorize: remote auth failed", res.status, errBody);
            if (errBody && errBody.message) {
              // Surface WP error message to NextAuth
              throw new Error(errBody.message);
            }
          } catch (e) {
            console.error("authorize: error handling remote failure", e);
          }
          return null;
        }

        let data;
        try {
          data = await res.json();
        } catch (e) {
          console.error("authorize: failed to parse auth response", e);
          return null;
        }

        // If the remote auth returned a token but didn't include a user display name or email,
        // attempt to fetch the WP user profile using the returned token.
        if (
          data &&
          data.token &&
          !(
            data.user_display_name ||
            data.user_email ||
            data.email ||
            data.user
          )
        ) {
          try {
            const meRes = await fetch(
              `${env.WP_URL.replace(/\/$/, "")}/wp-json/wp/v2/users/me`,
              {
                headers: { Authorization: `Bearer ${data.token}` },
                cache: "no-store",
              }
            );
            if (meRes.ok) {
              const me = await meRes.json().catch(() => null);
              if (me) {
                // normalize common fields
                data.user_display_name =
                  data.user_display_name || me.name || me.display_name || null;
                data.user_email = data.user_email || me.email || null;
                data.user = data.user || me;
              }
            }
          } catch (e) {
            console.error(
              "authorize: failed to fetch users/me for display name",
              e
            );
          }
        }

        // Normalize email + name
        const normalizedEmail = data.user_email || data.email || email;
        let name = null;

        if (data.user_display_name) name = data.user_display_name;
        else if (typeof data.user === "string") name = data.user;
        else if (data.user && typeof data.user === "object")
          name =
            data.user.name ||
            data.user.display_name ||
            data.user.user_display_name ||
            null;
        else if (data.name) name = data.name;

        if (!name) name = (normalizedEmail || "").split("@")[0];

        // Ensure Woo customer exists / create
        const wooCustomer = await syncCustomerToWoo(normalizedEmail, name);

        // 3️⃣ Mark this Woo customer as "credentials" login
        try {
          if (wooCustomer?.id) {
            await updateCustomerById(wooCustomer.id, {
              meta_data: [{ key: "auth_provider", value: "credentials" }],
            });
          }
        } catch (e) {
          console.warn("Failed to update Woo auth_provider to credentials", e);
        }

        // Return what will become `user` in callbacks
        return {
          id: normalizedEmail,
          name,
          email: normalizedEmail,
          wpCustomerId: wooCustomer?.id,
          // If you want WP JWT in session, uncomment:
          // wpToken: data.token,
        };
      },
    }),

    // GOOGLE PROVIDER (uses the same Woo + session logic via callbacks)
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
  ],

  secret: env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },

  callbacks: {
    /**
     * signIn runs for BOTH Credentials and Google.
     * We always ensure a Woo customer exists and attach wpCustomerId to `user`
     * so jwt() can persist it into the token.
     *
     * ❗ Google is no longer blocked even if the account was created with credentials.
     * ❗ But credentials login is still blocked for Google-only accounts (see authorize()).
     */
    async signIn({ user, account, profile }) {
      try {
        // Debug: log basic provider info to help trace Google sign-ins
        try {
          console.debug("nextauth.signIn callback", {
            provider: account?.provider,
            providerType: account?.type,
            userEmail: user?.email,
            profile: profile
              ? { id: profile?.id, name: profile?.name, email: profile?.email }
              : undefined,
          });
        } catch (logErr) {
          /* ignore logging errors */
        }

        if (user?.email) {
          const email = user.email;

          // 🔥 REMOVED: the "credentials-only" Google-blocking logic here

          // Normal sync to Woo + attach wpCustomerId
          const name =
            user.name ||
            // For Google, profile?.name is often present
            profile?.name ||
            email.split("@")[0];

          const wooCustomer = await syncCustomerToWoo(email, name);

          // attach to user object for jwt callback
          // @ts-ignore
          user.wpCustomerId = wooCustomer?.id;

          // If this is Google login, mark Woo customer as "google"
          if (account?.provider === "google" && wooCustomer?.id) {
            try {
              await updateCustomerById(wooCustomer.id, {
                meta_data: [{ key: "auth_provider", value: "google" }],
              });
            } catch (e) {
              console.warn("Failed to update Woo auth_provider to google", e);
            }
          }
        }

        return true;
      } catch (e) {
        console.error("signIn error:", e);
        // For credentials, throwing is fine; for OAuth we just let it bubble
        throw e;
      }
    },

    /**
     * jwt: runs on every auth event + subsequent requests.
     * This persists wpCustomerId, name, and email for BOTH Credentials and Google.
     */
    async jwt({ token, user, account }) {
      if (user) {
        // First time (on login) we have a `user`.
        // @ts-ignore
        if (user.wpCustomerId) {
          // @ts-ignore
          token.wpCustomerId = user.wpCustomerId;
        }

        token.name = user.name || token.name;
        token.email = user.email || token.email;

        // If you want Google tokens in JWT, you can also store them:
        // if (account?.provider === "google") {
        //   token.googleAccessToken = account.access_token;
        //   token.googleIdToken = account.id_token;
        // }
      }

      return token;
    },

    /**
     * session: this is what `useSession()` sees on the client.
     * We expose wpCustomerId, name, and email consistently for all providers.
     */
    async session({ session, token }) {
      if (!session.user) session.user = {};

      // expose Woo customer id
      // @ts-ignore
      session.user.wpCustomerId = token.wpCustomerId;

      session.user.name = token.name || session.user.name;
      session.user.email = token.email || session.user.email;

      return session;
    },
  },
};
