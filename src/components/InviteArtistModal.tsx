import { useState } from "react";
import axios from "axios";
import { X, Mail, Send, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../config/firebase";

interface InviteArtistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function InviteArtistModal({
  isOpen,
  onClose,
  onSuccess,
}: InviteArtistModalProps) {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleSendInvitation = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      if (!user) throw new Error("User not authenticated");

      // Get the ID token from Firebase auth directly
      let idToken: string | null = null;
      const currentUser = auth.currentUser;
      
      if (currentUser) {
        try {
          idToken = await currentUser.getIdToken();
        } catch (tokenErr) {
          console.error("Error getting ID token:", tokenErr);
          throw new Error("Failed to get authentication token");
        }
      } else {
        throw new Error("User session expired");
      }

      if (!idToken) {
        throw new Error("No authentication token available");
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/invitations/send`,
        { artistEmail: email },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      setSuccess(true);
      setSuccessMessage(response.data.message);
      setEmail("");

      // Auto-close after 2 seconds
      setTimeout(() => {
        onClose();
        setSuccess(false);
        onSuccess?.();
      }, 2000);
    } catch (err: any) {
      console.error("Invitation error:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Failed to send invitation"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 w-full max-w-md p-8 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          <X className="w-6 h-6" />
        </button>

        {success ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Invitation Sent!</h2>
            <p className="text-gray-300">{successMessage}</p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-blue-400" />
              <h2 className="text-2xl font-bold text-white">Invite Artist</h2>
            </div>

            <p className="text-gray-400 text-sm mb-6">
              Invite a new artist to your roster. They'll receive an invitation link to
              create their account and complete their profile.
            </p>

            {error && (
              <div className="flex items-start gap-3 p-4 mb-6 bg-red-900/20 border border-red-700 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSendInvitation} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Artist Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="artist@example.com"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                disabled={loading || !email}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition flex items-center justify-center gap-2"
              >
                {loading ? "Sending..." : (
                  <>
                    <Send className="w-4 h-4" />
                    Send Invitation
                  </>
                )}
              </button>
            </form>

            <p className="text-xs text-gray-500 text-center mt-6">
              💡 The invitation link expires in 7 days
            </p>
          </>
        )}
      </div>
    </div>
  );
}
