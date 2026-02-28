import { Router } from "express";
import Dj from "../models/Dj.js";

const router = Router();

// CREATE: Add a new DJ Profile
router.post("/", async (req, res) => {
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

// READ: Get all DJ Profiles
router.get("/", async (req, res) => {
  try {
    const djs = await Dj.find().sort({ createdAt: -1 });
    res.json(djs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching DJs", error });
  }
});

// UPDATE: Update a DJ Profile
router.put("/:id", async (req, res) => {
  try {
    const updatedDj = await Dj.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true, // Ensures the enum values (whatsapp, IG, etc.) are checked
    });
    res.json(updatedDj);
  } catch (error) {
    res.status(400).json({ message: "Error updating DJ", error });
  }
});

// DELETE: Remove a DJ
router.delete("/:id", async (req, res) => {
  try {
    await Dj.findByIdAndDelete(req.params.id);
    res.json({ message: "DJ deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting DJ", error });
  }
});

export default router;
