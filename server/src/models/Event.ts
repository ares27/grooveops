import mongoose, { Schema, Document } from "mongoose";

const EventSchema: Schema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  date: { type: Date, required: true },
  location: { type: String },
  djLineup: [
    {
      time: String,
      djId: { type: Schema.Types.ObjectId, ref: "Dj" },
      fee: Number,
    },
  ],
  status: {
    type: String,
    enum: ["draft", "confirmed", "cancelled"],
    default: "draft",
  },
  coordinatorId: { type: String, required: true }, // For now, a simple string ID
});

export default mongoose.model("Event", EventSchema);
