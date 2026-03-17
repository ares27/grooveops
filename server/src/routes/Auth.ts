import { Router } from "express";
import User from "../models/User.js";
import { verifyFirebaseToken, type AuthRequest } from "../middleware/auth.js";

const authRouter = Router();

/**
 * POST /auth/sync-user
 * Syncs Firebase user to MongoDB
 * Creates or updates user record with their role
 */
authRouter.post(
  "/sync-user",
  verifyFirebaseToken,
  async (req: AuthRequest, res) => {
    try {
      const {
        firebaseUid,
        email,
        displayName,
        photoURL,
        role,
        organiserProfile,
        belongsToOrganiser,
        isSetupComplete,
        emailVerified, // Allow emailVerified to be set from request
      } = req.body;

      if (!firebaseUid || !email) {
        return res
          .status(400)
          .json({ message: "firebaseUid and email required" });
      }

      // Use findOneAndUpdate with upsert to prevent race conditions
      // This atomically finds or creates the user
      const updateData: any = {
        firebaseUid,
        email,
        displayName: displayName || undefined,
        photoURL: photoURL || undefined,
        role: role || "Organiser",
        ...(belongsToOrganiser && { belongsToOrganiser }),
        ...(organiserProfile && { organiserProfile }),
      };

      // Only set to true, never revert to false via sync
      if (emailVerified === true) updateData.emailVerified = true;
      if (isSetupComplete === true) updateData.isSetupComplete = true;

      const user = await User.findOneAndUpdate(
        { firebaseUid }, // Find by firebaseUid
        updateData,
        {
          upsert: true, // Create if doesn't exist
          new: true, // Return updated document
          setDefaultsOnInsert: true, // Apply schema defaults on insert
        }
      );

      res.status(200).json({
        success: true,
        role: user.role,
        emailVerified: user.emailVerified,
        isSetupComplete: user.isSetupComplete,
        user: {
          _id: user._id,
          email: user.email,
          role: user.role,
          displayName: user.displayName,
        },
      });
    } catch (error) {
      console.error("User sync error:", error);
      res.status(500).json({
        message: "Failed to sync user",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

/**
 * GET /auth/user
 * Gets current user info from token
 */
authRouter.get("/user", verifyFirebaseToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user?.uid) {
      return res.status(401).json({ message: "User not found in token" });
    }

    const user = await User.findOne({ firebaseUid: req.user.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found in database" });
    }

    res.status(200).json({
      _id: user._id,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      isSetupComplete: user.isSetupComplete,
      belongsToOrganiser: user.belongsToOrganiser,
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({
      message: "Failed to get user",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

/**
 * PUT /auth/setup-complete
 * Mark artist profile setup as complete
 */
authRouter.put(
  "/setup-complete",
  verifyFirebaseToken,
  async (req: AuthRequest, res) => {
    try {
      if (!req.firebaseUid) {
        return res.status(401).json({ message: "User not authenticated" });
      }

      const user = await User.findOne({ firebaseUid: req.firebaseUid });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.isSetupComplete = true;
      await user.save();

      res.status(200).json({
        success: true,
        message: "Profile setup marked complete",
      });
    } catch (error) {
      console.error("Setup complete error:", error);
      res.status(500).json({
        message: "Failed to update setup status",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
);

export default authRouter;
