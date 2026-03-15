import admin from "firebase-admin";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK
// Make sure to set FIREBASE_SERVICE_ACCOUNT_KEY environment variable
// or place serviceAccountKey.json in the server root

try {
  let serviceAccountPath;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Load from environment variable
    serviceAccountPath = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  } else {
    // Try to load from file
    const serviceAccountFile = path.resolve(__dirname, "../../serviceAccountKey.json");
    
    if (fs.existsSync(serviceAccountFile)) {
      const fileContent = fs.readFileSync(serviceAccountFile, "utf-8");
      serviceAccountPath = JSON.parse(fileContent);
    } else {
      throw new Error(
        "serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT_KEY env var not set"
      );
    }
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
  });

  console.log("Firebase Admin SDK initialized");
} catch (error) {
  console.error(
    "Firebase Admin SDK initialization error:",
    error instanceof Error ? error.message : String(error)
  );
  console.log(
    "Make sure to set FIREBASE_SERVICE_ACCOUNT_KEY env var or place serviceAccountKey.json in server root"
  );
}

export default admin;
