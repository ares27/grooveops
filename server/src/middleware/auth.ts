import type { Request, Response, NextFunction } from "express";
import admin from "firebase-admin";
import User from "../models/User.js";

// Extend Express Request type to include user info
export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    iat?: number;
  };
  userRole?: string;
  userId?: string;
  firebaseUid?: string;
}

/**
 * Middleware to verify Firebase ID token and fetch user role
 * Attaches user data and role to request object
 */
export const verifyFirebaseToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split("Bearer ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      ...(decodedToken.email && { email: decodedToken.email }),
      ...(decodedToken.iat && { iat: decodedToken.iat }),
    };
    req.firebaseUid = decodedToken.uid;

    // Fetch user from MongoDB to get role
    const userDoc = await User.findOne({ firebaseUid: decodedToken.uid });
    if (userDoc) {
      req.userRole = userDoc.role;
      req.userId = userDoc._id?.toString();
    }

    next();
  } catch (error) {
    console.error("Firebase token verification error:", error);
    res.status(401).json({ message: "Invalid or expired token" });
  }
};

/**
 * Middleware to check if user has required role
 */
export const requireRole = (allowedRoles: string[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      // This will be set by the sync-user endpoint
      // For now, we'll check from the database in the route
      next();
    } catch (error) {
      res.status(500).json({ message: "Role check failed" });
    }
  };
};
