import "dotenv/config";

export const env = {
  PORT: Number(process.env.PORT) || 5000,
  NODE_ENV: process.env.NODE_ENV || "development",
  JWT_SECRET: process.env.JWT_SECRET || "dev-secret-change-me",
  AI_SERVICE_URL: process.env.AI_SERVICE_URL || "http://localhost:8000",
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID || "",
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL || "",
  FIREBASE_PRIVATE_KEY: (process.env.FIREBASE_PRIVATE_KEY || "").replace(
    /\\n/g,
    "\n"
  ),
  FIREBASE_STORAGE_BUCKET:
    process.env.FIREBASE_STORAGE_BUCKET ||
    (process.env.FIREBASE_PROJECT_ID
      ? `${process.env.FIREBASE_PROJECT_ID}.firebasestorage.app`
      : ""),
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || "",
  OPENAI_MODEL: process.env.OPENAI_MODEL || "gpt-4o",
  EMAIL_USER: process.env.EMAIL_USER || "growlifyai@gmail.com",
  EMAIL_PASS: process.env.EMAIL_PASS || "pyrbteybfgtbknwn",
};
