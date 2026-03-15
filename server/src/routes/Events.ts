import { Router } from "express";
import Event from "../models/Event.js";
import { verifyFirebaseToken, type AuthRequest } from "../middleware/auth.js";

const router = Router();

/**
 * Helper to redact financial data based on role
 */
const redactFinancialData = (event: any, userRole: string | undefined) => {
  if (userRole === "artist") {
    // Redact fees for other artists in the lineup
    const redactedEvent = JSON.parse(JSON.stringify(event));
    if (redactedEvent.djLineup && Array.isArray(redactedEvent.djLineup)) {
      redactedEvent.djLineup = redactedEvent.djLineup.map((slot: any) => ({
        ...slot,
        fee: undefined,
        finalFee: undefined,
      }));
    }
    // Redact total price
    redactedEvent.event_dj_total_price = undefined;
    return redactedEvent;
  }
  return event;
};

// CREATE: Create a new Event (Protected)
router.post("/", verifyFirebaseToken, async (req: AuthRequest, res) => {
  try {
    if (!req.firebaseUid) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const newEvent = new Event({
      ...req.body,
      createdBy: req.firebaseUid,
    });
    const savedEvent = await newEvent.save();
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: "Error creating event", error });
  }
});

// READ: Get all events with role-based filtering
router.get("/", verifyFirebaseToken, async (req: AuthRequest, res) => {
  try {
    let query: any = {};

    // Apply role-based filtering
    if (req.userRole === "Organiser") {
      // Organisers see only their own events
      query.createdBy = req.firebaseUid;
    } else if (req.userRole === "Artist") {
      // Artists can see events where they are in the lineup
      // We'll need to query differently
      const artistEvents = await Event.find({
        "djLineup.djId": req.userId,
      })
        .populate("djLineup.djId")
        .sort({ date: 1 });

      // Redact financial data for artists
      const redactedEvents = artistEvents.map((event) =>
        redactEvent(event.toObject(), req.userRole),
      );
      return res.json(redactedEvents);
    }
    // Admin sees all events (no query filter)

    const events = await Event.find(query)
      .populate("djLineup.djId")
      .sort({ date: 1 });

    // Redact financial data if needed
    const processedEvents = events.map((event) =>
      redactEvent(event.toObject(), req.userRole),
    );

    res.json(processedEvents);
  } catch (error) {
    res.status(500).json({ message: "Error fetching events", error });
  }
});

/**
 * Helper to redact event financial data
 */
function redactEvent(event: any, userRole: string | undefined): any {
  if (userRole === "artist") {
    return redactFinancialData(event, userRole);
  }
  return event;
}

// READ: Get a single event by ID (with role-based access and redaction)
router.get("/:id", verifyFirebaseToken, async (req: AuthRequest, res) => {
  try {
    const event = await Event.findById(req.params.id).populate("djLineup.djId");

    if (!event) {
      return res.status(404).json({ message: "Event not found in database" });
    }

    // Check access permissions
    if (req.userRole === "organiser" && (event as any).createdBy !== req.firebaseUid) {
      return res.status(403).json({
        message: "You don't have permission to view this event",
      });
    }

    // For artists, verify they're in the lineup
    if (req.userRole === "artist") {
      const djLineupArray = (event as any).djLineup as Array<{djId: any}>;
      const isInLineup = djLineupArray?.some(
        (slot: any) => slot.djId?.toString() === req.userId,
      );
      if (!isInLineup) {
        return res.status(403).json({
          message: "You don't have permission to view this event",
        });
      }
    }

    // Redact financial data
    const processedEvent = redactEvent(event.toObject(), req.userRole);
    res.json(processedEvent);
  } catch (error) {
    res.status(500).json({ message: "Error fetching event details", error });
  }
});

// UPDATE: Modify an existing Event
router.put(
  "/:id",
  verifyFirebaseToken,
  async (req: AuthRequest, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }

      // Only admin and the event creator can edit
      if (
        req.userRole !== "admin" &&
        event.createdBy !== req.firebaseUid
      ) {
        return res.status(403).json({
          message: "You don't have permission to edit this event",
        });
      }

      const updatedEvent = await Event.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        },
      ).populate("djLineup.djId");

      console.log(`✅ Event Updated: ${updatedEvent?.name}`);
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
  },
);

// DELETE: Remove an Event
router.delete(
  "/:id",
  verifyFirebaseToken,
  async (req: AuthRequest, res) => {
    try {
      const event = await Event.findById(req.params.id);

      if (!event) {
        return res.status(404).json({
          message: "Mission not found. Could not delete.",
        });
      }

      // Only admin and the event creator can delete
      if (
        req.userRole !== "admin" &&
        event.createdBy !== req.firebaseUid
      ) {
        return res.status(403).json({
          message: "You don't have permission to delete this event",
        });
      }

      await Event.findByIdAndDelete(req.params.id);

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
  },
);

export default router;
