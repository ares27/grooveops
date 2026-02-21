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

export default router;
