import mongoose, { Schema, Document } from "mongoose";

const EventSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String },
  eventFee: { type: Number, default: 0 }, // Entry fee for guests
  targetGenres: [{ type: String }], // Added to store Step 1 selections
  djLineup: [
    {
      time: String,
      djId: { type: Schema.Types.ObjectId, ref: "Dj" },
      artistAlias: String, // Stored for quick display
      name: String, // Stored for legal/contact info
      genres: [String], // Stored to show vibes in the list
      phone: String,
      instagram: String,
      fee: Number,
      bpm: Number, // Added to store manual BPM from Step 2
    },
  ],
  status: {
    type: String,
    enum: ["draft", "confirmed", "cancelled"],
    default: "draft",
  },
  event_status: {
    type: String,
    enum: ["Upcoming", "Happening", "Past"],
    default: "Upcoming",
  },
  coordinatorId: { type: String, required: true }, // For now, a simple string ID
  event_dj_total_price: { type: Number, default: 0 },
});

export default mongoose.model("Event", EventSchema);
