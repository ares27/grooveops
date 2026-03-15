import { useEffect, useState } from "react";
import { reload } from "firebase/auth";
import { auth } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import { Mail, RotateCw } from "lucide-react";

interface EmailVerificationCheckProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export default function EmailVerificationCheck({
  children,
  fallback,
}: EmailVerificationCheckProps) {
  const { user, role, getIdToken } = useAuth();
  const [isVerified, setIsVerified] = useState(false);
  const [loading, setLoading] = useState(true);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (!user || isVerified) {
      setLoading(false);
      return;
    }

    const checkVerification = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      try {
        await reload(currentUser);
        const firebaseVerified = currentUser.emailVerified;
        const idToken = await getIdToken(firebaseVerified);

        if (firebaseVerified) {
          await fetch(`${import.meta.env.VITE_API_URL}/auth/verify-email`, {
            method: "POST",
            headers: {
              Authorization: `Bearer ${idToken}`,
              "Content-Type": "application/json",
            },
          });
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/user`, {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.emailVerified) {
            setIsVerified(true);
          }
        }
      } catch (error) {
        console.error("Verification check error:", error);
      } finally {
        setLoading(false);
      }
    };

    checkVerification();
    const interval = setInterval(checkVerification, 3000);
    return () => clearInterval(interval);
  }, [user, isVerified, getIdToken]);

  const handleResendEmail = async () => {
    if (!user) return;
    try {
      setResendLoading(true);
      // Note: sendEmailVerification might fail if already sent recently
      // The user will need to wait or check spam folder
      console.log("Resend email verification");
    } catch (error) {
      setResendLoading(false);
    } finally {
      setResendLoading(false);
    }
  };

  // Bypass email verification for artists
  if (role === "Artist") {
    return <>{children || fallback}</>;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-800">
        <div className="text-center">
          <RotateCw className="w-8 h-8 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Checking verification status...</p>
        </div>
      </div>
    );
  }

  if (!isVerified && user?.email) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-800 px-4">
        <div className="w-full max-w-md p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 text-center">
          <Mail className="w-12 h-12 text-blue-400 mx-auto mb-6" />
          <h1 className="text-2xl font-bold text-white mb-4">
            Verify Your Email
          </h1>
          <p className="text-gray-300 mb-2">We sent a verification link to:</p>
          <p className="text-blue-400 font-semibold mb-6 break-all">
            {user.email}
          </p>

          <div className="bg-gray-700/50 border border-gray-600 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-semibold text-white mb-3">What to do next:</h3>
            <ol className="text-gray-300 text-sm space-y-2">
              <li>1. Check your inbox for our verification email</li>
              <li>2. Click the verification link</li>
              <li>3. Return here and you'll be all set!</li>
            </ol>
            <p className="text-gray-400 text-xs mt-4">
              💡 Tip: Check your spam folder if you don't see the email
            </p>
          </div>

          <button
            onClick={handleResendEmail}
            disabled={resendLoading}
            className="w-full bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition mb-3"
          >
            {resendLoading ? "Sending..." : "Resend Verification Email"}
          </button>

          <button
            onClick={async () => {
              if (auth.currentUser) {
                await reload(auth.currentUser);
                setIsVerified(auth.currentUser.emailVerified);
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
          >
            <RotateCw className="w-4 h-4" />
            I've Verified - Refresh
          </button>
        </div>
      </div>
    );
  }

  return <>{children || fallback}</>;
}
// (removed duplicate and stray code)
