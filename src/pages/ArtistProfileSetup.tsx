import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { auth } from "../config/firebase";
import axios from "axios";
import {
  Music,
  Volume2,
  Zap,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  User,
} from "lucide-react";

export default function ArtistProfileSetup() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 1: Personal Details
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [preferredComms, setPreferredComms] = useState<"whatsapp" | "IG" | "email">("email");

  // Step 2: Artist Identity
  const [alias, setAlias] = useState("");
  const [bio, setBio] = useState("");
  const [igLink, setIgLink] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [mixUrl, setMixUrl] = useState("");

  // Step 3: Sound
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedVibes, setSelectedVibes] = useState<string[]>([]);
  const [experience, setExperience] = useState<"emerging" | "novice" | "regular" | "veteran" | "pro" | "casual">("regular");

  // Step 4: Professional & Payment
  const [fee, setFee] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");

  const genreOptions = [
    "House", "Deep House", "Tech House",
    "Techno", "Minimal Techno",
    "Trance", "Progressive Trance",
    "Drum & Bass", "Liquid Funk",
    "Grime", "Garage",
    "Hip Hop", "Trap", "Dubstep",
    "Soul", "R&B", "Funk",
    "Latin", "Reggaeton", "Cumbia",
    "Amapiano", "Gqom", "Afrobeats",
  ];

  const vibesOptions = [
    "Upbeat", "Chill", "Dark", "Energetic",
    "Groovy", "Melodic", "Minimal", "Experimental",
    "Underground", "Commercial", "Soulful", "Hypnotic",
  ];

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const toggleVibe = (vibe: string) => {
    setSelectedVibes((prev) =>
      prev.includes(vibe) ? prev.filter((v) => v !== vibe) : [...prev, vibe]
    );
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!name.trim() || !surname.trim() || !contactNumber.trim()) {
        setError("Name, surname, and contact number are required");
        return;
      }
      setError("");
      setStep(2);
    } else if (step === 2) {
      if (!alias.trim() || !bio.trim()) {
        setError("Stage Alias and Bio are required");
        return;
      }
      setError("");
      setStep(3);
    } else if (step === 3) {
      if (selectedGenres.length === 0 || selectedVibes.length === 0) {
        setError("Please select at least one genre and vibe");
        return;
      }
      setError("");
      setStep(4);
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError("");
    }
  };

  const handleSubmit = async () => {
    if (step !== 4) return;

    setError("");
    setLoading(true);

    try {
      if (!fee || !bankName.trim() || !accountHolder.trim() || !accountNumber.trim()) {
        throw new Error("All payment fields are required");
      }

      if (isNaN(parseInt(fee)) || parseInt(fee) <= 0) {
        throw new Error("Fee must be a positive number");
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

      // Create complete DJ profile matching schema
      const djProfile = {
        email: user.email,
        name,
        surname,
        contactNumber,
        preferredComms,
        alias,
        bio,
        igLink,
        genres: selectedGenres,
        vibes: selectedVibes,
        experience,
        fee: parseInt(fee),
        bankName,
        accountHolder,
        accountNumber,
        ...(profilePic && { profilePic }),
        ...(mixUrl && { mixUrl }),
      };

      // POST to create DJ profile
      await axios.post(
        `${import.meta.env.VITE_API_URL}/djs`,
        djProfile,
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      // Update user's isSetupComplete flag
      await axios.put(
        `${import.meta.env.VITE_API_URL}/auth/setup-complete`,
        { isSetupComplete: true },
        {
          headers: {
            Authorization: `Bearer ${idToken}`,
          },
        }
      );

      // Redirect to Vault or Dashboard
      navigate("/vault");
    } catch (err: any) {
      console.error("Setup error:", err);
      setError(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Personal Details
  if (step === 1) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4 py-8">
        <div className="w-full max-w-lg p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700">
          <div className="flex items-center gap-3 mb-8">
            <User className="w-8 h-8 text-green-400" />
            <h1 className="text-2xl font-bold text-white">Artist Profile Setup</h1>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-300">Step 1 of 4</span>
              <span className="text-sm text-gray-400">Personal Details</span>
            </div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-1/4 bg-blue-600 transition-all"></div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-red-900/20 border border-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                First Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your first name"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                placeholder="Your last name"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Contact Number *
              </label>
              <input
                type="tel"
                value={contactNumber}
                onChange={(e) => setContactNumber(e.target.value)}
                placeholder="+27 XX XXX XXXX"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Preferred Communication */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Preferred Communication *
              </label>
              <div className="space-y-2">
                {(['whatsapp', 'IG', 'email'] as const).map((option) => (
                  <label key={option} className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="comms"
                      value={option}
                      checked={preferredComms === option}
                      onChange={(e) => setPreferredComms(e.target.value as typeof option)}
                      className="w-4 h-4"
                    />
                    <span className="text-gray-300 capitalize">{option === 'IG' ? 'Instagram' : option.charAt(0).toUpperCase() + option.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={() => navigate("/vault")}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Skip
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 2: Artist Identity
  if (step === 2) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4 py-8">
        <div className="w-full max-w-lg p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-h-screen overflow-y-auto">
          <div className="flex items-center gap-3 mb-8">
            <Music className="w-8 h-8 text-pink-400" />
            <h1 className="text-2xl font-bold text-white">Artist Profile Setup</h1>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-300">Step 2 of 4</span>
              <span className="text-sm text-gray-400">Artist Identity</span>
            </div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-2/4 bg-blue-600 transition-all"></div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-red-900/20 border border-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Stage Alias */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stage Alias *
              </label>
              <input
                type="text"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
                placeholder="Your stage name"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Bio *</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself and your music..."
                rows={4}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
              />
            </div>

            {/* Instagram Link */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Instagram Profile Link
              </label>
              <input
                type="url"
                value={igLink}
                onChange={(e) => setIgLink(e.target.value)}
                placeholder="https://instagram.com/yourprofile"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Profile Picture URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Profile Picture URL
              </label>
              <input
                type="url"
                value={profilePic}
                onChange={(e) => setProfilePic(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Mix/Demo URL */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mix or Demo Link
              </label>
              <input
                type="url"
                value={mixUrl}
                onChange={(e) => setMixUrl(e.target.value)}
                placeholder="https://soundcloud.com/your-mix or https://youtube.com/..."
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">💡 Link to your best mix or demo track</p>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handlePrevStep}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 3: Sound Profile
  if (step === 3) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4 py-8">
        <div className="w-full max-w-lg p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-h-screen overflow-y-auto">
          <div className="flex items-center gap-3 mb-8">
            <Volume2 className="w-8 h-8 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Artist Profile Setup</h1>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-300">Step 3 of 4</span>
              <span className="text-sm text-gray-400">Sound Profile</span>
            </div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-blue-600 transition-all"></div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-red-900/20 border border-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-6">
            {/* Genres */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Genres * ({selectedGenres.length} selected)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {genreOptions.map((genre) => (
                  <button
                    key={genre}
                    onClick={() => toggleGenre(genre)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      selectedGenres.includes(genre)
                        ? "bg-purple-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Vibes */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Vibes * ({selectedVibes.length} selected)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {vibesOptions.map((vibe) => (
                  <button
                    key={vibe}
                    onClick={() => toggleVibe(vibe)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      selectedVibes.includes(vibe)
                        ? "bg-pink-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {vibe}
                  </button>
                ))}
              </div>
            </div>

            {/* Experience Level */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">
                Experience Level *
              </label>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value as typeof experience)}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="casual">Casual</option>
                <option value="emerging">Emerging</option>
                <option value="novice">Novice</option>
                <option value="regular">Regular</option>
                <option value="veteran">Veteran</option>
                <option value="pro">Professional</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handlePrevStep}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Step 4: Professional & Payment
  if (step === 4) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 px-4 py-8">
        <div className="w-full max-w-lg p-8 bg-gray-800 rounded-2xl shadow-2xl border border-gray-700 max-h-screen overflow-y-auto">
          <div className="flex items-center gap-3 mb-8">
            <Zap className="w-8 h-8 text-yellow-400" />
            <h1 className="text-2xl font-bold text-white">Artist Profile Setup</h1>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-gray-300">Step 4 of 4</span>
              <span className="text-sm text-gray-400">Professional & Payment</span>
            </div>
            <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
              <div className="h-full w-full bg-blue-600 transition-all"></div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 mb-6 bg-red-900/20 border border-red-700 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Base Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Base Fee (R/Hour) *
              </label>
              <input
                type="number"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                placeholder="e.g., 500"
                min="0"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
              <p className="text-xs text-gray-400 mt-1">
                💡 Organisers can adjust this per event
              </p>
            </div>

            {/* Bank Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bank Name *
              </label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g., First National Bank"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Account Holder */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Holder Name *
              </label>
              <input
                type="text"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
                placeholder="Your full name (as on bank account)"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Account Number */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Account Number *
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="Your bank account number"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="bg-gray-700/30 p-4 rounded-lg mt-6">
            <h3 className="text-sm font-semibold text-gray-300 mb-2">Profile Summary:</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>✓ Name: <span className="text-white">{name} {surname}</span></li>
              <li>✓ Stage Alias: <span className="text-white">{alias}</span></li>
              <li>✓ Genres: <span className="text-white">{selectedGenres.length} selected</span></li>
              <li>✓ Vibes: <span className="text-white">{selectedVibes.length} selected</span></li>
              <li>✓ Experience: <span className="text-white capitalize">{experience}</span></li>
            </ul>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={handlePrevStep}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg transition flex items-center justify-center gap-2"
            >
              {loading ? "Saving..." : (
                <>
                  <Check className="w-4 h-4" /> Complete Profile
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  }
}
