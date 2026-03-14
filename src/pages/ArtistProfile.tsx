import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import type { Dj } from "../types/dj";
import { fetchDjById, updateDj } from "../services/api";
import {
  ArrowLeft,
  Mail,
  Phone,
  Music,
  Zap,
  Briefcase,
  Edit2,
  Instagram,
  Radio,
  Save,
  X,
  AlertCircle,
  ChevronDown,
  CreditCard,
} from "lucide-react";

const BANK_OPTIONS = [
  "ABSA",
  "First National Bank",
  "Nedbank",
  "Standard Bank",
  "Capitec",
  "Discovery Bank",
  "TymeBank",
];

const ArtistProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [artist, setArtist] = React.useState<Dj | null>(null);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [editForm, setEditForm] = React.useState<Partial<Dj>>({});
  const [showAllGenres, setShowAllGenres] = React.useState(false);
  const [showAllVibes, setShowAllVibes] = React.useState(false);
  const [showPaymentAccordion, setShowPaymentAccordion] = React.useState(false);

  React.useEffect(() => {
    const getArtist = async () => {
      if (!id) {
        setError("Artist ID not provided.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await fetchDjById(id);
        setArtist(data);
        setEditForm(data);
      } catch (err) {
        setError("Failed to fetch artist data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    getArtist();
  }, [id]);

  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm(artist || {});
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    if (!id || !artist) return;
    try {
      setIsSaving(true);
      await updateDj(id, editForm as Dj);
      setArtist({ ...artist, ...editForm });
      setIsEditing(false);
      setError(null);
    } catch (err) {
      setError("Failed to save artist data.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setEditForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleArrayInputChange = (field: "genres" | "vibes", value: string) => {
    const arrayValue = value.split(",").map((v) => v.trim());
    setEditForm((prev) => ({ ...prev, [field]: arrayValue }));
  };

  if (loading) {
    return (
      <div className="p-10 text-indigo-500 font-mono text-[10px] animate-pulse">
        ACCESSING_ARTIST_PROFILE...
      </div>
    );
  }

  if (error && !artist) {
    return (
      <div className="p-4 text-center text-red-500 bg-red-500/10 rounded-lg">
        {error}
      </div>
    );
  }

  if (!artist) {
    return <div className="p-4 text-center">Artist not found.</div>;
  }

  return (
    <div className="p-4 max-w-md mx-auto pb-24 text-white animate-in fade-in duration-500">
      {/* HEADER WITH BACK BUTTON */}
      <div className="flex items-center gap-3 mb-6 mt-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-indigo-500 hover:text-indigo-400 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-2xl font-black italic uppercase tracking-tighter leading-none">
          Artist Profile
        </h1>
        {isEditing && (
          <div className="flex items-center gap-1 text-orange-400 ml-auto text-[10px] font-black uppercase tracking-widest bg-orange-500/10 px-2 py-1 rounded-full border border-orange-500/20">
            <AlertCircle size={12} className="animate-pulse" />
            Editing
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* HERO SECTION */}
      <div
        className={`bg-gradient-to-br ${isEditing ? "from-orange-500 via-orange-600 to-red-700" : "from-indigo-500 via-indigo-600 to-indigo-900"} p-[1px] rounded-[2.5rem] mb-8 shadow-2xl shadow-indigo-900/50 transition-all`}
      >
        <div className="bg-zinc-950/60 backdrop-blur-xl rounded-[2.45rem] p-8 relative overflow-hidden border border-white/5">
          <div className="relative z-10">
            {isEditing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.alias || ""}
                  onChange={(e) => handleInputChange("alias", e.target.value)}
                  placeholder="Stage Alias"
                  maxLength={30}
                  className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-2xl font-black uppercase italic outline-none focus:border-orange-500 truncate"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={editForm.name || ""}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="First Name"
                    maxLength={20}
                    className="bg-black/40 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-orange-500 truncate"
                  />
                  <input
                    type="text"
                    value={editForm.surname || ""}
                    onChange={(e) =>
                      handleInputChange("surname", e.target.value)
                    }
                    placeholder="Surname"
                    maxLength={20}
                    className="bg-black/40 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-orange-500 truncate"
                  />
                </div>
                <textarea
                  value={editForm.bio || ""}
                  onChange={(e) => handleInputChange("bio", e.target.value)}
                  placeholder="Bio"
                  maxLength={150}
                  rows={2}
                  className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs outline-none focus:border-orange-500 resize-none"
                />
                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={editForm.experience || ""}
                    onChange={(e) =>
                      handleInputChange("experience", e.target.value)
                    }
                    className="bg-black/40 border border-white/10 p-2 rounded-xl text-[10px] outline-none focus:border-orange-500"
                  >
                    <option value="">Experience</option>
                    <option value="emerging">Emerging</option>
                    <option value="novice">Novice</option>
                    <option value="regular">Regular</option>
                    <option value="veteran">Veteran</option>
                    <option value="pro">Pro</option>
                    <option value="casual">Casual</option>
                  </select>
                  <input
                    type="number"
                    value={editForm.fee || 0}
                    onChange={(e) =>
                      handleInputChange("fee", Number(e.target.value))
                    }
                    placeholder="Fee"
                    className="bg-black/40 border border-white/10 p-2 rounded-xl text-[10px] outline-none focus:border-orange-500"
                  />
                  <select
                    value={editForm.preferredComms || ""}
                    onChange={(e) =>
                      handleInputChange("preferredComms", e.target.value)
                    }
                    className="bg-black/40 border border-white/10 p-2 rounded-xl text-[10px] outline-none focus:border-orange-500"
                  >
                    <option value="">Comms</option>
                    <option value="whatsapp">WhatsApp</option>
                    <option value="IG">Instagram</option>
                    <option value="email">Email</option>
                  </select>
                </div>
              </div>
            ) : (
              <>
                <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-4 truncate">
                  {artist.alias}
                </h2>
                <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mb-4 truncate">
                  {artist.name} {artist.surname}
                </p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <div className="flex items-center gap-1.5 text-indigo-200 text-[10px] font-bold uppercase tracking-wide bg-white/5 px-3 py-1 rounded-full border border-white/10 whitespace-nowrap">
                    <Briefcase size={12} />
                    {artist.experience}
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-200 text-[10px] font-bold uppercase tracking-wide bg-white/5 px-3 py-1 rounded-full border border-white/10 whitespace-nowrap">
                    R {artist.fee?.toLocaleString() || "0"}
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-200 text-[10px] font-bold uppercase tracking-wide bg-white/5 px-3 py-1 rounded-full border border-white/10 whitespace-nowrap">
                    <Radio size={12} />
                    {artist.preferredComms}
                  </div>
                </div>

                {artist.bio && (
                  <p className="text-xs text-zinc-300 leading-relaxed italic opacity-80 mb-4 line-clamp-3">
                    {artist.bio}
                  </p>
                )}
              </>
            )}

            <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
          </div>
        </div>
      </div>

      {/* CONTACT SECTION */}
      <div className="space-y-4 mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 px-2">
          Contact Details
        </h3>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 group hover:border-indigo-500/50 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Mail size={16} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Email
              </p>
              {isEditing ? (
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-xs outline-none focus:border-orange-500 truncate"
                />
              ) : (
                <p className="text-xs font-bold truncate">{artist.email}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 group hover:border-indigo-500/50 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Phone size={16} className="text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Phone
              </p>
              {isEditing ? (
                <input
                  type="tel"
                  value={editForm.contactNumber || ""}
                  onChange={(e) =>
                    handleInputChange("contactNumber", e.target.value)
                  }
                  className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-xs outline-none focus:border-orange-500 truncate"
                />
              ) : (
                <p className="text-xs font-bold truncate">
                  {artist.contactNumber}
                </p>
              )}
            </div>
            {!isEditing && (
              <a
                href={`tel:${artist.contactNumber}`}
                className="p-2 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-400 hover:text-white transition-all flex-shrink-0"
              >
                <Phone size={14} />
              </a>
            )}
          </div>
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 group hover:border-pink-500/50 transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-pink-500/10 border border-pink-500/20 flex items-center justify-center flex-shrink-0">
              <Instagram size={16} className="text-pink-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                Instagram
              </p>
              {isEditing ? (
                <input
                  type="url"
                  value={editForm.igLink || ""}
                  onChange={(e) => handleInputChange("igLink", e.target.value)}
                  placeholder="https://instagram.com/..."
                  className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-xs outline-none focus:border-orange-500 truncate"
                />
              ) : (
                <p className="text-xs font-bold truncate">
                  {artist.igLink || "Not provided"}
                </p>
              )}
            </div>
            {!isEditing && artist.igLink && (
              <a
                href={artist.igLink}
                target="_blank"
                rel="noreferrer"
                className="p-2 rounded-lg bg-pink-600/20 hover:bg-pink-600 text-pink-400 hover:text-white transition-all flex-shrink-0"
              >
                <Instagram size={14} />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* CREATIVE SECTION */}
      <div className="space-y-4 mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 px-2">
          Creative Profile
        </h3>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Music size={14} className="text-indigo-400" />
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
              Genres
            </p>
          </div>
          {isEditing ? (
            <textarea
              value={(editForm.genres || []).join(", ")}
              onChange={(e) => handleArrayInputChange("genres", e.target.value)}
              placeholder="Comma-separated genres"
              rows={2}
              className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-xs outline-none focus:border-orange-500 resize-none"
            />
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {(showAllGenres
                  ? artist.genres
                  : artist.genres?.slice(0, 5)
                )?.map((g) => (
                  <span
                    key={g}
                    className="text-[8px] bg-indigo-500/10 text-indigo-300 px-2.5 py-1 rounded-md font-black uppercase tracking-widest border border-indigo-500/20 truncate"
                  >
                    {g}
                  </span>
                ))}
              </div>
              {(artist.genres?.length || 0) > 5 && (
                <button
                  onClick={() => setShowAllGenres(!showAllGenres)}
                  className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 mt-2 transition-all"
                >
                  {showAllGenres
                    ? "Show less"
                    : `+${(artist.genres?.length || 0) - 5} more`}
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${showAllGenres ? "rotate-180" : ""}`}
                  />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-amber-400" />
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
              Vibes
            </p>
          </div>
          {isEditing ? (
            <textarea
              value={(editForm.vibes || []).join(", ")}
              onChange={(e) => handleArrayInputChange("vibes", e.target.value)}
              placeholder="Comma-separated vibes"
              rows={2}
              className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-xs outline-none focus:border-orange-500 resize-none"
            />
          ) : (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {(showAllVibes ? artist.vibes : artist.vibes?.slice(0, 5))?.map(
                  (v) => (
                    <span
                      key={v}
                      className="text-[8px] bg-amber-500/10 text-amber-300 px-2.5 py-1 rounded-md font-black uppercase tracking-widest border border-amber-500/20 truncate"
                    >
                      #{v}
                    </span>
                  ),
                )}
              </div>
              {(artist.vibes?.length || 0) > 5 && (
                <button
                  onClick={() => setShowAllVibes(!showAllVibes)}
                  className="text-[9px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 mt-2 transition-all"
                >
                  {showAllVibes
                    ? "Show less"
                    : `+${(artist.vibes?.length || 0) - 5} more`}
                  <ChevronDown
                    size={12}
                    className={`transition-transform ${showAllVibes ? "rotate-180" : ""}`}
                  />
                </button>
              )}
            </div>
          )}
        </div>

        <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Radio size={14} className="text-purple-400" />
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
              Mix
            </p>
          </div>
          {isEditing ? (
            <input
              type="url"
              value={editForm.mixUrl || ""}
              onChange={(e) => handleInputChange("mixUrl", e.target.value)}
              placeholder="https://soundcloud.com/..."
              className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-xs outline-none focus:border-orange-500 truncate"
            />
          ) : artist.mixUrl ? (
            <a
              href={artist.mixUrl}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-purple-400 hover:text-purple-300 truncate break-all underline"
            >
              Listen to mix →
            </a>
          ) : (
            <p className="text-xs text-zinc-400 italic">Not provided</p>
          )}
        </div>
      </div>

      {/* PAYMENT SECTION */}
      <div className="space-y-4 mb-8">
        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 px-2">
          Payment Details
        </h3>

        <div
          className={`border ${showPaymentAccordion ? "border-green-500/50 bg-green-500/5" : "border-zinc-800 bg-zinc-900/50"} rounded-[2rem] overflow-hidden transition-all duration-300 shadow-inner`}
        >
          <button
            type="button"
            onClick={() => setShowPaymentAccordion(!showPaymentAccordion)}
            className="w-full p-5 flex justify-between items-center hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <CreditCard
                size={18}
                className={
                  showPaymentAccordion ? "text-green-400" : "text-zinc-500"
                }
              />
              <span
                className={`text-[10px] font-black uppercase tracking-[0.2em] ${showPaymentAccordion ? "text-green-400" : "text-zinc-400"}`}
              >
                {artist.bankName || artist.accountHolder || artist.accountNumber
                  ? "Bank Details"
                  : "Add Payment Details"}
              </span>
            </div>
            <ChevronDown
              size={18}
              className={`transition-transform duration-300 ${showPaymentAccordion ? "rotate-180 text-green-400" : "text-zinc-600"}`}
            />
          </button>

          {showPaymentAccordion && (
            <div className="p-5 pt-0 space-y-3 animate-in slide-in-from-top-2 duration-300">
              {isEditing ? (
                <>
                  <select
                    value={editForm.bankName || ""}
                    onChange={(e) =>
                      handleInputChange("bankName", e.target.value)
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-xs text-zinc-300 outline-none focus:border-green-500"
                  >
                    <option value="">-- Select Bank --</option>
                    {BANK_OPTIONS.map((bank) => (
                      <option key={bank} value={bank}>
                        {bank}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Account Holder Name"
                    value={editForm.accountHolder || ""}
                    onChange={(e) =>
                      handleInputChange("accountHolder", e.target.value)
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-xs focus:border-green-500 outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Account Number"
                    value={editForm.accountNumber || ""}
                    onChange={(e) =>
                      handleInputChange("accountNumber", e.target.value)
                    }
                    className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-xs focus:border-green-500 outline-none"
                  />
                </>
              ) : (
                <>
                  {artist.bankName && (
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-green-600 mb-1">
                        Bank
                      </p>
                      <p className="text-sm font-bold text-green-300 truncate">
                        {artist.bankName}
                      </p>
                    </div>
                  )}
                  {artist.accountHolder && (
                    <div
                      className={
                        artist.bankName
                          ? "pt-2 border-t border-green-500/10"
                          : ""
                      }
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest text-green-600 mb-1">
                        Account Holder
                      </p>
                      <p className="text-sm font-bold text-green-300 truncate">
                        {artist.accountHolder}
                      </p>
                    </div>
                  )}
                  {artist.accountNumber && (
                    <div
                      className={
                        artist.bankName || artist.accountHolder
                          ? "pt-2 border-t border-green-500/10"
                          : ""
                      }
                    >
                      <p className="text-[9px] font-black uppercase tracking-widest text-green-600 mb-1">
                        Account Number
                      </p>
                      <p className="text-sm font-mono font-bold text-green-300 truncate">
                        {artist.accountNumber}
                      </p>
                    </div>
                  )}
                  {!artist.bankName &&
                    !artist.accountHolder &&
                    !artist.accountNumber && (
                      <p className="text-xs text-zinc-400 italic py-2">
                        No payment details provided.
                      </p>
                    )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-black uppercase tracking-widest py-4 rounded-[2rem] transition-all active:scale-95 shadow-lg shadow-green-500/20 flex items-center justify-center gap-2"
            >
              <Save size={18} />
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={handleEditToggle}
              disabled={isSaving}
              className="flex-1 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-white font-black uppercase tracking-widest py-4 rounded-[2rem] transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <X size={18} />
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={handleEditToggle}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black uppercase tracking-widest py-4 rounded-[2rem] transition-all active:scale-95 shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
          >
            <Edit2 size={18} />
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default ArtistProfile;
