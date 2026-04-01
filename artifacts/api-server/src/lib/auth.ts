import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const ACCESS_SECRET = process.env.SESSION_SECRET ?? "access_secret_fallback";
const REFRESH_SECRET = (process.env.SESSION_SECRET ?? "refresh_secret_fallback") + "_refresh";

export const ACCESS_EXPIRY = "15m";
export const REFRESH_EXPIRY = "7d";

export function signAccessToken(payload: { userId: number; role: string }) {
  return jwt.sign(payload, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRY });
}

export function signRefreshToken(payload: { userId: number }) {
  return jwt.sign(payload, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRY });
}

export function verifyAccessToken(token: string): { userId: number; role: string } {
  return jwt.verify(token, ACCESS_SECRET) as { userId: number; role: string };
}

export function verifyRefreshToken(token: string): { userId: number } {
  return jwt.verify(token, REFRESH_SECRET) as { userId: number };
}

export interface AuthRequest extends Request {
  userId?: number;
  userRole?: string;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = authHeader.slice(7);
  try {
    const payload = verifyAccessToken(token);
    req.userId = payload.userId;
    req.userRole = payload.role;
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

export function requireRole(...roles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    next();
  };
}
