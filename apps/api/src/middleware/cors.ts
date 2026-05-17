import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { env } from "../env";

const allowedOrigins = env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());

export const corsMiddleware = cors({
  origin: (origin) => {
    if (env.NODE_ENV === "production" && origin === "*") {
      return null;
    }
    return allowedOrigins.includes(origin) ? origin : null;
  },
  allowHeaders: ["Content-Type", "Authorization", "Accept"],
  allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  credentials: true,
});

export const securityHeaders = secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    connectSrc: ["'self'"],
    imgSrc: ["'self'", "data:"],
    styleSrc: ["'self'", "'unsafe-inline'"],
  },
  xContentTypeOptions: "nosniff",
  xFrameOptions: "DENY",
  strictTransportSecurity: "max-age=63072000; includeSubDomains; preload",
  permissionsPolicy: {
    camera: [],
    microphone: [],
    geolocation: [],
  },
});
