import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";

// Import your routes
import djRoutes from "./routes/DJProfiles.js";
import eventRoutes from "./routes/Events.js";

const app = express();
app.use(express.json());

// CORS condiguration to allow requests from the frontend
app.use(
  cors({
    // origin: process.env.FRONTEND_URL // e.g., https://grooveops.onrender.com
    origin: "*",
  }),
);

// API Routes
app.use("/api/djs", djRoutes);
app.use("/api/events", eventRoutes);

const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/grooveops";
console.log("Attempting to connect to:", process.env.MONGODB_URI);
mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Basic Health Check
app.get("/health", (req, res) => res.send("GrooveOps API Running"));

app.listen(PORT, () => {
  console.log(`🚀 Server ready at http://localhost:${PORT}`);
});
