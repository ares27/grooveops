import { useState, useEffect } from "react";
import { djService } from "../services/api";
import {
  AlertCircle,
  Search,
  Phone,
  Plus,
  X,
  Trash2,
  User,
  Mail,
  CheckSquare,
  Square,
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

// Predefined Options
const GENRE_OPTIONS = [
  "Techno",
  "House",
  "Amapiano",
  "Hip-Hop",
  "Afro-Tech",
  "Drum & Bass",
];
const VIBE_OPTIONS = [
  "Dark",
  "High-Energy",
  "Melodic",
  "Underground",
  "Sunset",
  "Main-Stage",
];

const Vault = () => {
  const [djs, setDjs] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showPaymentAccordion, setShowPaymentAccordion] = useState(false); // NEW
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  // Expanded Form State
  const [newDj, setNewDj] = useState<any>({
    email: "",
    name: "",
    surname: "",
    contactNumber: "",
    preferredComms: "",
    alias: "",
    bio: "",
    igLink: "",
    genres: [],
    vibes: [],
    experience: "regular",
    fee: 0,
    // paymentDetails: "",
    mixUrl: "",
    // NEW Payment Structure
    bankName: "",
    accountHolder: "",
    accountNumber: "",
  });

  // --- VALIDATION LOGIC ---
  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isPhoneValid = (phone: string) =>
    /^(\+?\d{1,3}[- ]?)?\d{10}$/.test(phone.replace(/\s/g, ""));
  const isFeeValid = !isNaN(newDj.fee) && newDj.fee >= 0;

  const canSave =
    newDj.alias.trim().length > 0 &&
    isEmailValid(newDj.email) &&
    isPhoneValid(newDj.contactNumber) &&
    isFeeValid;

  const fetchDjs = () => {
    setLoading(true);
    djService.getAll().then((res) => {
      setDjs(res.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDjs();
  }, []);

  // NEW: Toggle logic for checkboxes
  const toggleSelection = (item: string, field: "genres" | "vibes") => {
    const currentSelection = newDj[field];
    if (currentSelection.includes(item)) {
      setNewDj({
        ...newDj,
        [field]: currentSelection.filter((i: string) => i !== item),
      });
    } else {
      setNewDj({
        ...newDj,
        [field]: [...currentSelection, item],
      });
    }
  };

  // const removeTag = (tag: string, field: "vibes" | "genres") => {
  //   setNewDj({
  //     ...newDj,
  //     [field]: newDj[field].filter((t: string) => t !== tag),
  //   });
  // };

  const handleDelete = async (id: string, alias: string) => {
    if (window.confirm(`Remove ${alias} from the Vault?`)) {
      try {
        await djService.delete(id);
        fetchDjs();
      } catch (err) {
        alert("Error deleting artist.");
      }
    }
  };

  const handleSave = async () => {
    if (!canSave) return;
    // 1. Capture the current fee from state and ensure it's a number
    const currentFee = Number(newDj.fee) || 0;

    // 2. Build the payload explicitly
    const payload = {
      ...newDj,
      fee: currentFee,
      createdAt: new Date(),
    };

    try {
      console.log("SENDING TO DATABASE:", payload);
      await djService.create(payload);
      setShowAddForm(false);
      resetForm();
      fetchDjs();
    } catch (err) {
      console.error("Save Error:", err);
      alert("Error saving artist.");
    }
  };

  const resetForm = () => {
    setNewDj({
      email: "",
      name: "",
      surname: "",
      contactNumber: "",
      preferredComms: "",
      alias: "",
      bio: "",
      igLink: "",
      genres: [],
      vibes: [],
      experience: "regular",
      fee: 0,
      paymentDetails: "",
      mixUrl: "",
    });
    setShowPaymentAccordion(false);
  };

  const filteredDjs = djs.filter((dj) =>
    dj.alias?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="p-10 text-indigo-500 font-mono text-[10px] animate-pulse">
        ACCESSING_ENCRYPTED_VAULT...
      </div>
    );

  return (
    <div className="p-4 max-w-md mx-auto pb-24 text-white animate-in fade-in duration-500">
      {/* Header */}
      <header className="mb-8 mt-4 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic leading-none uppercase">
            DJ{" "}
            <span className="text-indigo-500 underline decoration-indigo-500/20">
              VAULT
            </span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            Official Asset Roster
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`p-3 rounded-2xl transition-all active:scale-90 ${
            showAddForm
              ? "bg-zinc-800 text-zinc-400"
              : "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
          }`}
        >
          {showAddForm ? <X size={24} /> : <Plus size={24} strokeWidth={3} />}
        </button>
      </header>

      {showAddForm && (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] mb-10 space-y-6 animate-in fade-in zoom-in duration-300 shadow-2xl">
          <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/50">
            <User className="text-indigo-500" size={18} />
            <h2 className="text-sm font-black uppercase tracking-widest text-indigo-400">
              Artist Onboarding
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* --- IDENTITY SECTION --- */}
            <div className="col-span-2 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">
                  Stage Alias
                </label>
                <input
                  className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all shadow-inner"
                  placeholder="e.g. DJ Shadow"
                  value={newDj.alias}
                  onChange={(e) =>
                    setNewDj({ ...newDj, alias: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">
                    First Name
                  </label>
                  <input
                    className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all"
                    placeholder="John"
                    value={newDj.name}
                    onChange={(e) =>
                      setNewDj({ ...newDj, name: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-zinc-500 ml-1">
                    Surname
                  </label>
                  <input
                    className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all"
                    placeholder="Doe"
                    value={newDj.surname}
                    onChange={(e) =>
                      setNewDj({ ...newDj, surname: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>

            {/* --- CONTACT SECTION --- */}
            <div className="col-span-2 space-y-3">
              <div className="relative group">
                <input
                  className={`w-full bg-black border ${newDj.email && !isEmailValid(newDj.email) ? "border-red-500" : "border-zinc-800"} p-4 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all`}
                  placeholder="Email Address *"
                  type="email"
                  value={newDj.email}
                  onChange={(e) =>
                    setNewDj({ ...newDj, email: e.target.value })
                  }
                />
                {newDj.email && !isEmailValid(newDj.email) && (
                  <AlertCircle
                    size={18}
                    className="absolute right-4 top-4 text-red-500 animate-pulse"
                  />
                )}
              </div>

              <div className="relative group">
                <input
                  className={`w-full bg-black border ${newDj.contactNumber && !isPhoneValid(newDj.contactNumber) ? "border-red-500" : "border-zinc-800"} p-4 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all`}
                  placeholder="Contact Number *"
                  value={newDj.contactNumber}
                  onChange={(e) =>
                    setNewDj({ ...newDj, contactNumber: e.target.value })
                  }
                />
                {newDj.contactNumber && !isPhoneValid(newDj.contactNumber) && (
                  <AlertCircle
                    size={18}
                    className="absolute right-4 top-4 text-red-500 animate-pulse"
                  />
                )}
              </div>
            </div>

            {/* --- CREATIVE SECTION --- */}
            <div className="col-span-2 pt-2 space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black flex items-center gap-2">
                  <span className="w-4 h-[1px] bg-zinc-800" /> Select Genres
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GENRE_OPTIONS.map((genre) => (
                    <button
                      key={genre}
                      onClick={() => toggleSelection(genre, "genres")}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                        newDj.genres.includes(genre)
                          ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-500/20"
                          : "bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                    >
                      {newDj.genres.includes(genre) ? (
                        <CheckSquare size={14} />
                      ) : (
                        <Square size={14} />
                      )}
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 font-black flex items-center gap-2">
                  <span className="w-4 h-[1px] bg-zinc-800" /> Select Vibes
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {VIBE_OPTIONS.map((vibe) => (
                    <button
                      key={vibe}
                      onClick={() => toggleSelection(vibe, "vibes")}
                      className={`flex items-center gap-3 p-3 rounded-xl border text-[10px] font-bold uppercase transition-all ${
                        newDj.vibes.includes(vibe)
                          ? "bg-zinc-200 border-white text-black"
                          : "bg-black border-zinc-800 text-zinc-500 hover:border-zinc-700"
                      }`}
                    >
                      {newDj.vibes.includes(vibe) ? (
                        <CheckSquare size={14} />
                      ) : (
                        <Square size={14} />
                      )}
                      {vibe}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="col-span-2">
              <textarea
                className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm focus:border-indigo-500 outline-none h-24 resize-none transition-all shadow-inner"
                placeholder="Short Bio / Artist History"
                value={newDj.bio}
                onChange={(e) => setNewDj({ ...newDj, bio: e.target.value })}
              />
            </div>

            {/* --- LOGISTICS SECTION --- */}
            <div className="col-span-1 space-y-1.5">
              <label className="text-[9px] text-zinc-500 ml-1 font-black uppercase tracking-widest">
                Fee (R) *
              </label>
              <input
                type="number"
                className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm focus:border-indigo-500 outline-none"
                placeholder="0"
                value={newDj.fee}
                onChange={(e) =>
                  setNewDj({
                    ...newDj,
                    fee: e.target.value === "" ? "" : Number(e.target.value),
                  })
                }
              />
            </div>

            <div className="col-span-1 space-y-1.5">
              <label className="text-[9px] text-zinc-500 ml-1 font-black uppercase tracking-widest">
                Experience
              </label>
              <select
                className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm text-zinc-400 outline-none focus:border-indigo-500 transition-all"
                value={newDj.experience}
                onChange={(e) =>
                  setNewDj({ ...newDj, experience: e.target.value })
                }
              >
                <option value="bedroom">Bedroom</option>
                <option value="regular">Regular</option>
                <option value="pro">Pro</option>
              </select>
            </div>

            <div className="col-span-2 space-y-4 pt-2">
              <select
                className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm text-zinc-400 outline-none focus:border-indigo-500 transition-all"
                value={newDj.preferredComms}
                onChange={(e) =>
                  setNewDj({ ...newDj, preferredComms: e.target.value })
                }
              >
                <option value="whatsapp">Preferred: WhatsApp</option>
                <option value="IG">Preferred: IG</option>
                <option value="email">Preferred: Email</option>
              </select>

              <input
                className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all"
                placeholder="Instagram Link (URL)"
                value={newDj.igLink}
                onChange={(e) => setNewDj({ ...newDj, igLink: e.target.value })}
              />

              <input
                className="w-full bg-black border border-zinc-800 p-4 rounded-2xl text-sm focus:border-indigo-500 outline-none transition-all"
                placeholder="Mix URL (Soundcloud / Mixcloud)"
                value={newDj.mixUrl}
                onChange={(e) => setNewDj({ ...newDj, mixUrl: e.target.value })}
              />

              {/* PAYMENT ACCORDION */}
              <div
                className={`border ${showPaymentAccordion ? "border-indigo-500/50 bg-indigo-500/5" : "border-zinc-800 bg-black"} rounded-[2rem] overflow-hidden transition-all duration-300 shadow-inner`}
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
                        showPaymentAccordion
                          ? "text-indigo-400"
                          : "text-zinc-500"
                      }
                    />
                    <span
                      className={`text-[10px] font-black uppercase tracking-[0.2em] ${showPaymentAccordion ? "text-indigo-400" : "text-zinc-400"}`}
                    >
                      Payment Details
                    </span>
                  </div>
                  <ChevronDown
                    size={18}
                    className={`transition-transform duration-300 ${showPaymentAccordion ? "rotate-180 text-indigo-400" : "text-zinc-600"}`}
                  />
                </button>

                {showPaymentAccordion && (
                  <div className="p-5 pt-0 space-y-3 animate-in slide-in-from-top-2 duration-300">
                    <select
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-xs text-zinc-300 outline-none focus:border-indigo-500"
                      value={newDj.bankName}
                      onChange={(e) =>
                        setNewDj({ ...newDj, bankName: e.target.value })
                      }
                    >
                      <option value="">-- Select Bank --</option>
                      {BANK_OPTIONS.map((bank) => (
                        <option key={bank} value={bank}>
                          {bank}
                        </option>
                      ))}
                    </select>
                    <input
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-xs focus:border-indigo-500 outline-none"
                      placeholder="Account Holder Name"
                      value={newDj.accountHolder}
                      onChange={(e) =>
                        setNewDj({ ...newDj, accountHolder: e.target.value })
                      }
                    />
                    <input
                      className="w-full bg-zinc-950 border border-zinc-800 p-4 rounded-xl text-xs focus:border-indigo-500 outline-none"
                      placeholder="Account Number"
                      value={newDj.accountNumber}
                      onChange={(e) =>
                        setNewDj({ ...newDj, accountNumber: e.target.value })
                      }
                    />
                  </div>
                )}
              </div>

              <button
                disabled={!canSave}
                onClick={handleSave}
                className="w-full bg-indigo-600 py-5 rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm hover:bg-indigo-500 shadow-xl shadow-indigo-900/40 transition-all active:scale-[0.98] disabled:opacity-50 disabled:grayscale"
              >
                Deploy To Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {!showAddForm && (
        <div className="space-y-4">
          <div className="relative mb-8 group">
            <Search
              className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-indigo-500 transition-colors"
              size={20}
            />
            <input
              type="text"
              placeholder="Search encrypted roster..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-12 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold shadow-inner"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="space-y-4">
            {filteredDjs.map((dj) => (
              <div
                key={dj._id}
                className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] group transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tighter italic leading-none">
                      {dj.alias}
                    </h3>
                    <div className="flex gap-2 items-center">
                      <span className="text-[9px] text-indigo-500 font-black uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded">
                        {dj.experience}
                      </span>
                      <span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest truncate max-w-[120px]">
                        {dj.name} {dj.surname}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <p className="text-green-500 font-mono font-black text-xl leading-none">
                      R{dj.fee?.toLocaleString()}
                    </p>
                    <button
                      onClick={() => handleDelete(dj._id, dj.alias)}
                      className="p-2 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-5">
                  {dj.genres?.map((g: string) => (
                    <span
                      key={g}
                      className="text-[8px] bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-md font-black uppercase tracking-widest border border-zinc-800/50"
                    >
                      {g}
                    </span>
                  ))}
                  {dj.vibes?.map((v: string) => (
                    <span
                      key={v}
                      className="text-[8px] bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md font-black uppercase tracking-widest border border-indigo-500/20"
                    >
                      #{v}
                    </span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-4 pt-5 mt-6 border-t border-zinc-800/50">
                  <div className="flex items-center gap-2.5 text-[10px] font-bold text-zinc-500">
                    <div className="bg-zinc-800 p-1.5 rounded-lg">
                      <Phone size={12} className="text-indigo-500" />
                    </div>
                    <span className="truncate">
                      {dj.contactNumber || "UNLISTED"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2.5 text-[10px] font-bold text-zinc-500">
                    <div className="bg-zinc-800 p-1.5 rounded-lg">
                      <Mail size={12} className="text-indigo-500" />
                    </div>
                    <span className="truncate">{dj.email || "UNLISTED"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Vault;
