import { Router } from "express";
import Dj from "../models/Dj.js";
import { verifyFirebaseToken, type AuthRequest } from "../middleware/auth.js";
import User from "../models/User.js";

const router = Router();

/**
 * Helper to redact bank details based on role and ownership
 */
const redactBankDetails = (
  dj: any,
  userRole: string | undefined,
  userId: string | undefined,
) => {
  const djObj = dj.toObject ? dj.toObject() : { ...dj };

  // Redact bank details unless user is admin or viewing their own profile
  if (userRole !== "Admin") {
    // Check if this is the user's own profile
    const isOwnProfile = userId && djObj._id && userId === djObj._id.toString();

    if (!isOwnProfile) {
      // Redact bank details for non-admin, non-owner
      djObj.bankName = undefined;
      djObj.accountHolder = undefined;
      djObj.accountNumber = undefined;
    }
  }

  return djObj;
};

// CREATE: Add a new DJ Profile
router.post("/", verifyFirebaseToken, async (req: AuthRequest, res) => {
  try {
    const {
      vibes,
      genres,
      bankName,
      accountHolder,
      accountNumber,
      ...otherData
    } = req.body;

    // Helper to turn strings or messy arrays into clean tag arrays
    const cleanTags = (tags: any) => {
      if (Array.isArray(tags)) return tags.map((t) => t.trim().toLowerCase());
      if (typeof tags === "string")
        return tags.split(",").map((t) => t.trim().toLowerCase());
      return [];
    };

    const newDj = new Dj({
      ...otherData,
      bankName: bankName?.trim(),
      accountHolder: accountHolder?.trim(),
      accountNumber: accountNumber?.trim(),
      vibes: cleanTags(vibes),
      genres: cleanTags(genres),
    });

    const savedDj = await newDj.save();

    // Link this DJ profile to the user's MongoDB account (Artist)
    if (req.firebaseUid) {
      const user = await User.findOne({ firebaseUid: req.firebaseUid });
      if (user && user.role === "Artist") {
        user.djProfile = {
          alias: otherData.alias,
          bio: otherData.bio,
          genres: cleanTags(genres),
          vibes: cleanTags(vibes),
          experience: otherData.experience,
          fee: otherData.fee,
          bankName: bankName?.trim(),
          accountHolder: accountHolder?.trim(),
          accountNumber: accountNumber?.trim(),
          profilePic: otherData.profilePic,
          mixUrl: otherData.mixUrl,
          socials: otherData.socials,
        };
        await user.save();
      }
    }

    res.status(201).json(savedDj);
  } catch (error) {
    // Check for unique email error (MongoDB code 11000)
    if ((error as any).code === 11000) {
      return res
        .status(400)
        .json({ message: "This email is already registered in the Vault." });
    }
    res.status(400).json({ message: "Error creating DJ profile", error });
  }
});

// READ: Get all DJ Profiles (with role-based filtering)
router.get("/", verifyFirebaseToken, async (req: AuthRequest, res) => {
  try {
    const query: any = {};

    // Note: Previously organisers were restricted to artists they invited.
    // Now all organisers see the full pool of artists.
    // Admins and Artists also see all DJs.

    const djs = await Dj.find(query).sort({ createdAt: -1 });

    // Redact bank details for each DJ
    const redactedDjs = djs.map((dj) =>
      redactBankDetails(dj, req.userRole, req.userId),
    );

    res.json(redactedDjs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching DJs", error });
  }
});

// READ: Get a single DJ Profile by ID (with bank detail redaction)
router.get("/:id", verifyFirebaseToken, async (req: AuthRequest, res) => {
  try {
    const dj = await Dj.findById(req.params.id);
    if (!dj) {
      return res.status(404).json({ message: "DJ not found" });
    }

    // Redact bank details based on role
    const redactedDj = redactBankDetails(dj, req.userRole, req.userId);
    res.json(redactedDj);
  } catch (error) {
    res.status(500).json({ message: "Error fetching DJ", error });
  }
});

// UPDATE: Update a DJ Profile (Protected)
router.put("/:id", verifyFirebaseToken, async (req: AuthRequest, res) => {
  try {
    const dj = await Dj.findById(req.params.id);

    if (!dj) {
      return res.status(404).json({ message: "DJ not found" });
    }

    // Only admin can change baseFee
    if (req.body.fee && req.userRole !== "Admin") {
      // For artists editing their own profile, remove fee from update
      if (req.userRole === "Artist") {
        delete req.body.fee;
      } else if (req.userRole !== "Admin") {
        return res.status(403).json({
          message: "Only admins can set base rates",
        });
      }
    }

    const updatedDj = await Dj.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    // Redact bank details in response
    const redactedDj = redactBankDetails(updatedDj, req.userRole, req.userId);
    res.json(redactedDj);
  } catch (error) {
    res.status(400).json({ message: "Error updating DJ", error });
  }
});

// DELETE: Remove a DJ (Admin only)
router.delete("/:id", verifyFirebaseToken, async (req: AuthRequest, res) => {
  try {
    if (req.userRole !== "Organiser" && req.userRole !== "Admin") {
      return res.status(403).json({
        message: "Only organisers can delete DJ profiles",
      });
    }

    await Dj.findByIdAndDelete(req.params.id);
    res.json({ message: "DJ deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting DJ", error });
  }
});

export default router;
