import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  firebaseUid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: "Admin" | "Organiser" | "Artist";
  emailVerified: boolean;
  // For artist invitation system
  invitationToken?: string;
  invitationTokenExpiry?: Date;
  isSetupComplete: boolean; // Whether artist has completed profile setup
  // Artist-specific profile
  djProfile?: {
    alias: string;
    bio: string;
    genres: string[];
    vibes: string[];
    experience: string;
    fee: number;
    bankName?: string;
    accountHolder?: string;
    accountNumber?: string;
    profilePic?: string;
    mixUrl?: string;
    socials?: {
      instagram?: string;
      twitter?: string;
      spotify?: string;
      soundcloud?: string;
    };
  };
  // Organiser-specific profile
  organiserProfile?: {
    companyName: string;
    phone: string;
    location: string;
    verified: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    displayName: String,
    photoURL: String,
    role: {
      type: String,
      enum: ["Admin", "Organiser", "Artist"],
      default: "Artist",
      required: true,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    invitationToken: String,
    invitationTokenExpiry: Date,
    isSetupComplete: {
      type: Boolean,
      default: false,
    },
    djProfile: {
      alias: String,
      bio: String,
      genres: [String],
      vibes: [String],
      experience: String,
      fee: Number,
      bankName: String,
      accountHolder: String,
      accountNumber: String,
      profilePic: String,
      mixUrl: String,
      socials: {
        instagram: String,
        twitter: String,
        spotify: String,
        soundcloud: String,
      },
    },
    organiserProfile: {
      companyName: String,
      phone: String,
      location: String,
      verified: { type: Boolean, default: false },
    },
  },
  { timestamps: true },
);

export default mongoose.model<IUser>("User", userSchema);
