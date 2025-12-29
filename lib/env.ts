// Server-side environment validation helper
type Env = {
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  WP_URL: string;
  WC_CONSUMER_KEY: string;
  WC_CONSUMER_SECRET: string;
  WP_JWT_URL?: string;
  GOOGLE_CLIENT_ID?: string;
  GOOGLE_CLIENT_SECRET?: string;
};

const required = [
  "NEXTAUTH_URL",
  "NEXTAUTH_SECRET",
  "WP_URL",
  "WC_CONSUMER_KEY",
  "WC_CONSUMER_SECRET",
];

const missing: string[] = [];
for (const k of required) {
  if (!process.env[k]) missing.push(k);
}

if (missing.length) {
  throw new Error(
    `Missing required environment variables: ${missing.join(", ")}`
  );
}

const env: Env = {
  NEXTAUTH_URL: process.env.NEXTAUTH_URL as string,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET as string,
  WP_URL: (process.env.WP_URL as string).replace(/\/$/, ""),
  WC_CONSUMER_KEY: process.env.WC_CONSUMER_KEY as string,
  WC_CONSUMER_SECRET: process.env.WC_CONSUMER_SECRET as string,
  WP_JWT_URL: process.env.WP_JWT_URL,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
};

export default env;
export { env };
