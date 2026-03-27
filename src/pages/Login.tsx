import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "../config/firebase";
import { Mail, Lock, Loader, AlertCircle, Music } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch (err: any) {
      const errorMessage = err.message || "Authentication failed";
      if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else if (
        err.code === "auth/user-not-found" ||
        err.code === "auth/wrong-password"
      ) {
        setError("Invalid email or password");
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err: any) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google sign-in failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white flex flex-col">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      {/* Content */}
      <div className="relative flex flex-col items-center justify-center flex-1 p-4">
        {/* Logo Section */}
        <div className="mb-12 text-center animate-in fade-in slide-in-from-top duration-500">
          <div className="bg-indigo-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-500/30">
            <Music size={32} className="text-white" strokeWidth={2.5} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter italic uppercase">
            GROOVE
            <span className="text-indigo-500 block text-2xl font-black mt-1">
              OPS
            </span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3">
            Artist & Event Management
          </p>
        </div>

        {/* Auth Card */}
        <div className="w-full max-w-sm animate-in fade-in zoom-in-95 duration-500 delay-100">
          <div className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 p-8 rounded-[2.5rem] shadow-2xl">
            {/* Header */}
            <h2 className="text-xl font-black uppercase tracking-tight text-white mb-6 text-center">
              Welcome Back
            </h2>

            {/* Form */}
            <form onSubmit={handleEmailAuth} className="space-y-4 mb-6">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/50"
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-black border border-zinc-800 p-4 pl-10 rounded-2xl text-sm focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">
                  Password
                </label>
                <div className="relative">
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500/50"
                  />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-black border border-zinc-800 p-4 pl-10 rounded-2xl text-sm focus:border-indigo-500 focus:shadow-lg focus:shadow-indigo-500/20 outline-none transition-all"
                    required
                  />
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2">
                  <AlertCircle
                    size={16}
                    className="text-red-500 flex-shrink-0"
                  />
                  <p className="text-[9px] font-bold text-red-500">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-black uppercase tracking-widest py-3 rounded-2xl shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2 mt-6"
              >
                {loading ? (
                  <>
                    <Loader size={16} className="animate-spin" />
                    SIGNING IN...
                  </>
                ) : (
                  "SIGN IN"
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[9px] font-black text-zinc-600 uppercase">
                Or
              </span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {/* Google Sign In */}
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full border border-zinc-800 bg-zinc-950/50 hover:bg-zinc-900 text-white font-black uppercase tracking-widest py-3 rounded-2xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader size={16} className="animate-spin" />
                  LOADING...
                </>
              ) : (
                <>
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
                  GOOGLE
                </>
              )}
            </button>
          </div>

          <div className="text-center space-y-2 mt-8">
            <div className="flex flex-col gap-2 pt-4 border-t border-zinc-800">
              <Link
                to="/organiser-signup"
                className="text-[9px] text-indigo-400 hover:text-indigo-300 font-black uppercase tracking-widest transition"
              >
                → Sign up as Organiser
              </Link>
              <p className="text-[8px] text-zinc-600 uppercase">
                (Artists: wait for invitation link)
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
