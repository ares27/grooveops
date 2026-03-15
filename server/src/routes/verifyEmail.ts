import { Router } from "express";
import User from "../models/User.js";
import { verifyFirebaseToken, type AuthRequest } from "../middleware/auth.js";

const verifyEmailRouter = Router();

/**
 * POST /auth/verify-email
 * Updates emailVerified in MongoDB for the current user
 */
verifyEmailRouter.post(
  "/verify-email",
  verifyFirebaseToken,
  async (req: AuthRequest, res) => {
    try {
      if (!req.user?.uid) {
        return res.status(401).json({ message: "User not found in token" });
      }
      console.log(`Backend: Received verification request for UID: ${req.user.uid}`);
      const user = await User.findOne({ firebaseUid: req.user.uid });
      if (!user) {
        console.log(`Backend: User not found in MongoDB for UID: ${req.user.uid}`);
        return res.status(404).json({ message: "User not found in database" });
      }
      
      if (user.emailVerified) {
        console.log(`Backend: User ${req.user.uid} already verified in MongoDB`);
        return res.status(200).json({ success: true, emailVerified: true, alreadyVerified: true });
      }

      user.emailVerified = true;
      await user.save();
      console.log(`Backend: Successfully updated emailVerified to true for user: ${user.email}`);
      res.status(200).json({ success: true, emailVerified: true });
    } catch (error) {
      console.error("Verify email error:", error);
      res.status(500).json({
        message: "Failed to update emailVerified",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
);

export default verifyEmailRouter;
