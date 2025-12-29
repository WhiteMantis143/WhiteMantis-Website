import crypto from "crypto";

const KEY_HEX = process.env.ENCRYPTION_KEY || "";
if (!KEY_HEX || KEY_HEX.length !== 64) {
  throw new Error("ENCRYPTION_KEY must be 64 hex chars");
}

const KEY = Buffer.from(KEY_HEX, "hex");
const ALGO = "aes-256-gcm";

export function encryptObject(obj: any): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, KEY, iv);
  const plaintext = Buffer.from(JSON.stringify(obj));
  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, ciphertext]).toString("base64url");
}

export function decryptToObject(token: string) {
  const raw = Buffer.from(token, "base64url");
  const iv = raw.slice(0, 12);
  const tag = raw.slice(12, 28);
  const data = raw.slice(28);

  const decipher = crypto.createDecipheriv(ALGO, KEY, iv);
  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([decipher.update(data), decipher.final()]);
  return JSON.parse(decrypted.toString());
}
