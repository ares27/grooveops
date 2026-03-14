import { Router } from "express";
import Event from "../models/Event.js";

const router = Router();

// CREATE: Create a new Event
router.post("/", async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: "Error creating event", error });
  }
});

// READ: Get all events (populated with DJ data)
router.get("/", async (req, res) => {
  try {
    const events = await Event.find()
      .populate("djLineup.djId")
      .sort({ date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error });
  }
});

// READ: Get a single event by ID (populated with DJ data)
router.get("/:id", async (req, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("djLineup.djId");

    if (!event) {
      return res.status(404).json({ message: "Event not found in database" });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: "Error fetching event details", error });
  }
});

// UPDATE: Modify an existing Event's parameters and lineup
router.put("/:id", async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true, // Returns the modified document instead of the original
        runValidators: true, // Ensures the new data follows your Schema rules
      },
    ).populate("djLineup.djId");

    if (!updatedEvent) {
      return res
        .status(404)
        .json({ message: "Mission not found. Update failed." });
    }

    console.log(`✅ Event Updated: ${updatedEvent.name}`);
    res.json(updatedEvent);
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    console.error("❌ Update Error:", error);
    res.status(400).json({
      message: "Critical Error: Could not update event mission logs",
      error: errorMessage,
    });
  }
});

// DELETE: Remove an Event from the Logs
router.delete("/:id", async (req, res) => {
  try {
    const deletedEvent = await Event.findByIdAndDelete(req.params.id);

    if (!deletedEvent) {
      return res.status(404).json({
        message: "Mission not found. Could not delete.",
      });
    }

    res.json({
      message: "Event purged from database successfully",
      deletedId: req.params.id,
    });
  } catch (error) {
    res.status(500).json({
      message: "Critical Error: Could not delete event",
      error,
    });
  }
});

export default router;
