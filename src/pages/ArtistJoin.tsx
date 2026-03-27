import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import axios from "axios";
import { AlertCircle, Music, ArrowRight } from "lucide-react";

export default function ArtistJoin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const invitedEmail = searchParams.get("email") || "";

  const [email, setEmail] = useState(invitedEmail);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate inputs
      if (!email || !password || !confirmPassword) {
        throw new Error("All fields are required");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const firebaseUser = userCredential.user;

      // Create MongoDB user with artist role
      const idToken = await firebaseUser.getIdToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/sync-user`,
        {
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: "Artist",
          isSetupComplete: false,
          emailVerified: true, // Always set true for invited artists
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      );

      setSuccess(true);
      // Redirect to profile setup immediately to avoid race conditions with AuthContext sync
      navigate("/artist-profile-setup");
    } catch (err: any) {
      console.error("Signup error:", err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered");
      } else if (err.code === "auth/weak-password") {
        setError("Password is too weak");
      } else {
        setError(err.message || "Signup failed");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-2xl border border-green-700/30 text-center">
          <Music className="w-12 h-12 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">
            Welcome to GrooveOps!
          </h1>
          <p className="text-gray-300 mb-6">
            Account created successfully. Let's complete your artist profile...
          </p>
          <div className="flex items-center justify-center">
            <ArrowRight className="w-6 h-6 text-blue-400 animate-bounce" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
        <div className="flex items-center justify-center mb-6">
          <Music className="w-8 h-8 text-blue-400 mr-3" />
          <h1 className="text-3xl font-bold text-white">Join as Artist</h1>
        </div>
        <p className="text-gray-400 text-center mb-6">
          Create your artist account
        </p>

        {error && (
          <div className="flex items-start gap-3 p-4 mb-6 bg-red-900/20 border border-red-700 rounded-lg">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSignup} className="space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirm Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition mt-6"
          >
            {loading ? "Creating Account..." : "Complete Signup"}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>You'll complete your profile next</p>
        </div>
      </div>
    </div>
  );
}
