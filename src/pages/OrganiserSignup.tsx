import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  AlertCircle,
  Mail,
  Building2,
  Phone,
  MapPin,
  Loader,
  Music,
} from "lucide-react";

export default function OrganiserSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Validate inputs
      if (
        !email ||
        !password ||
        !confirmPassword ||
        !companyName ||
        !phone ||
        !location
      ) {
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

      // Send verification email
      await sendEmailVerification(firebaseUser);

      // Create MongoDB user with organiser role
      const idToken = await firebaseUser.getIdToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/sync-user`,
        {
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: "Organiser",
          organiserProfile: {
            companyName,
            phone,
            location,
            verified: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      );

      setVerificationSent(true);
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

  const handleGoogleSignup = async () => {
    setError("");

    // Validate required organiser fields first
    if (!companyName || !phone || !location) {
      setError(
        "Please fill in Company Name, Phone, and Location before using Google Sign-Up",
      );
      return;
    }

    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;

      // Create/Sync MongoDB user with organiser role
      const idToken = await firebaseUser.getIdToken();
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/sync-user`,
        {
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName,
          photoURL: firebaseUser.photoURL,
          role: "Organiser",
          emailVerified: firebaseUser.emailVerified,
          organiserProfile: {
            companyName,
            phone,
            location,
            verified: false,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        },
      );

      navigate("/");
    } catch (err: any) {
      console.error("Google signup error:", err);
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google sign-up failed");
      }
    } finally {
      setLoading(false);
    }
  };

  // Verification email sent state
  if (verificationSent) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black p-4">
        <div className="w-full max-w-md p-8 bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-[2.5rem] shadow-2xl text-center">
          <div className="bg-indigo-600/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black text-white uppercase tracking-tight mb-4">
            Check Your Inbox
          </h1>
          <p className="text-zinc-400 text-sm mb-6">
            We've sent a verification email to{" "}
            <strong className="text-indigo-400">{email}</strong>
          </p>
          <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest leading-relaxed">
            Click the link in your email to verify your account and get started
            as an Organiser.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="mt-8 text-indigo-400 hover:text-indigo-300 text-[10px] font-black uppercase tracking-widest"
          >
            ← Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex flex-col p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      <div className="relative flex flex-col items-center justify-center flex-1 max-w-2xl mx-auto w-full">
        {/* Logo Section */}
        <div className="mb-8 text-center">
          <div className="bg-indigo-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-500/30">
            <Music size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-black tracking-tighter italic uppercase">
            GROOVE
            <span className="text-indigo-500 block text-lg font-black mt-0.5">
              OPS
            </span>
          </h1>
          <p className="text-zinc-500 text-[8px] font-black uppercase tracking-[0.2em] mt-2">
            Organiser Registration
          </p>
        </div>

        <div className="w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-[2.5rem] shadow-2xl">
          <h2 className="text-xl font-black uppercase tracking-tight text-white mb-8 text-center">
            Create Organiser Account
          </h2>

          <form onSubmit={handleSignup} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex items-start gap-3">
                <AlertCircle
                  size={18}
                  className="text-red-500 flex-shrink-0 mt-0.5"
                />
                <p className="text-xs font-bold text-red-400">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Info */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-2 px-1">
                  1. Login Credentials
                </h3>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-black border border-zinc-800 p-4 pl-10 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="space-y-4">
                <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-2 px-1">
                  2. Organisation Details
                </h3>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">
                    Company/Entity Name
                  </label>
                  <div className="relative">
                    <Building2
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                    />
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Blue Moon Events"
                      className="w-full bg-black border border-zinc-800 p-4 pl-10 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                    />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+27..."
                      className="w-full bg-black border border-zinc-800 p-4 pl-10 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin
                      size={16}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
                    />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="City, Country"
                      className="w-full bg-black border border-zinc-800 p-4 pl-10 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black uppercase tracking-widest py-4 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <Loader size={18} className="animate-spin" />
                ) : (
                  "CREATE ACCOUNT"
                )}
              </button>

              <div className="flex items-center gap-3 py-2">
                <div className="flex-1 h-px bg-zinc-800" />
                <span className="text-[9px] font-black text-zinc-600 uppercase">
                  Or
                </span>
                <div className="flex-1 h-px bg-zinc-800" />
              </div>

              <button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 text-white font-black uppercase tracking-widest py-4 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                CONTINUE WITH GOOGLE
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
            <button
              onClick={() => navigate("/login")}
              className="text-[10px] text-zinc-500 hover:text-white font-black uppercase tracking-widest transition"
            >
              ← Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
