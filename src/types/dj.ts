export interface Dj {
  _id: string; // Add _id for MongoDB documents
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
  experience: "emerging" | "novice" | "regular" | "veteran" | "pro" | "casual";
  profilePic?: string;
  mixUrl?: string;
  bankName?: string;
  accountHolder?: string;
  accountNumber?: string;
  fee?: number; // Added fee from server model
}
