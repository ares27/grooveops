import mongoose, { Schema, Document } from "mongoose";

export interface IDj extends Document {
  email: string;
  name: string;
  surname: string;
  contactNumber: string;
  preferredComms: "whatsapp" | "IG" | "email";
  alias: string;
  bio: string;
  igLink: string;
  genres: string[];
  vibes: string[];
  experience: "bedroom" | "regular" | "pro";
  profilePic?: string;
  mixUrl?: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  createdAt: Date;
}

const DjSchema: Schema = new Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  surname: { type: String, required: true },
  contactNumber: { type: String },
  preferredComms: {
    type: String,
    enum: ["whatsapp", "IG", "email"],
    default: "email",
  },
  alias: { type: String, required: true },
  bio: { type: String },
  igLink: { type: String },
  fee: { type: Number, default: 0 },
  genres: [
    {
      type: String,
      trim: true,
      lowercase: true,
    },
  ],
  vibes: [
    {
      type: String,
      trim: true,
      lowercase: true,
    },
  ],
  experience: {
    type: String,
    enum: ["bedroom", "regular", "pro"],
    default: "regular",
  },
  bankName: { type: String, trim: true },
  accountHolder: { type: String, trim: true },
  accountNumber: { type: String, trim: true },
  profilePic: { type: String },
  mixUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IDj>("Dj", DjSchema);
