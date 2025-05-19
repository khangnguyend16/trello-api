import { env } from "~/config/environment";

// Những domain được phép truy cập tới tài nguyên của Server
export const WHITELIST_DOMAINS = [
  // Không cần localhost nữa vì ở file cors đã luôn luôn cho phép môi trường dev
  // "http://localhost:5173",
  "https://trello-web-amber-tau.vercel.app",
  // ... (domain chính thức sau deploy)
];

export const BOARD_TYPES = {
  PUBLIC: "public",
  PRIVATE: "private",
};

export const WEBSITE_DOMAIN = env.BUILD_MODE === "production" ? env.WEBSITE_DOMAIN_PRODUCTION : env.WEBSITE_DOMAIN_DEVELOPMENT;
