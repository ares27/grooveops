import { useState, useEffect } from "react";
import { djService } from "../services/api";
import { Search, Phone, Plus, X, Trash2, User, Mail } from "lucide-react";

const Vault = () => {
  const [djs, setDjs] = useState<any[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
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
    genres: [],
    vibes: [],
    experience: "regular",
    fee: 0,
    paymentDetails: "",
    mixUrl: "",
  });

  const [vibeInput, setVibeInput] = useState("");
  const [genreInput, setGenreInput] = useState("");

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

  // Tag Logic for Vibes & Genres
  const handleKeyDown = (e: React.KeyboardEvent, field: "vibes" | "genres") => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const inputVal = field === "vibes" ? vibeInput : genreInput;
      const value = inputVal.trim().replace(",", "");

      if (value && !newDj[field].includes(value)) {
        setNewDj({ ...newDj, [field]: [...newDj[field], value] });
        field === "vibes" ? setVibeInput("") : setGenreInput("");
      }
    }
  };

  const removeTag = (tag: string, field: "vibes" | "genres") => {
    setNewDj({
      ...newDj,
      [field]: newDj[field].filter((t: string) => t !== tag),
    });
  };

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
      genres: [],
      vibes: [],
      experience: "regular",
      fee: 0,
      paymentDetails: "",
      mixUrl: "",
    });
    setVibeInput("");
    setGenreInput("");
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
    <div className="p-4 max-w-md mx-auto pb-24 text-white">
      <header className="mb-6 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic">
            DJ <span className="text-indigo-500">VAULT</span>
          </h1>
          <p className="text-zinc-400 text-sm">Official Roster</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className={`p-3 rounded-2xl transition-all ${showAddForm ? "bg-zinc-800" : "bg-indigo-600 shadow-lg shadow-indigo-500/20"}`}
        >
          {showAddForm ? <X size={24} /> : <Plus size={24} />}
        </button>
      </header>

      {showAddForm && (
        <div className="bg-zinc-900 border border-indigo-500/30 p-5 rounded-3xl mb-8 space-y-4 animate-in fade-in zoom-in duration-200">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <User className="text-indigo-500" size={18} /> Artist Onboarding
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {/* --- IDENTITY SECTION --- */}
            <div className="col-span-2">
              <input
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none transition-colors"
                placeholder="Stage Alias"
                value={newDj.alias}
                onChange={(e) => setNewDj({ ...newDj, alias: e.target.value })}
              />
            </div>

            <input
              className="bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none"
              placeholder="First Name"
              value={newDj.name}
              onChange={(e) => setNewDj({ ...newDj, name: e.target.value })}
            />
            <input
              className="bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none"
              placeholder="Surname"
              value={newDj.surname}
              onChange={(e) => setNewDj({ ...newDj, surname: e.target.value })}
            />

            <div className="col-span-2">
              <input
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none"
                placeholder="Email Address"
                value={newDj.email}
                onChange={(e) => setNewDj({ ...newDj, email: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <input
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none"
                placeholder="Contact Number"
                value={newDj.contactNumber}
                onChange={(e) =>
                  setNewDj({ ...newDj, contactNumber: e.target.value })
                }
              />
            </div>

            {/* --- CREATIVE SECTION (TAGS) --- */}
            <div className="col-span-2 space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">
                Genres
              </label>
              <input
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none"
                placeholder="Type & press Enter..."
                value={genreInput}
                onChange={(e) => setGenreInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "genres")}
              />
              <div className="flex flex-wrap gap-2">
                {newDj.genres.map((g: string) => (
                  <span
                    key={g}
                    className="flex items-center gap-1 bg-zinc-800 text-zinc-300 px-2 py-1 rounded-lg text-[10px] uppercase font-bold"
                  >
                    {g}{" "}
                    <X
                      size={12}
                      className="cursor-pointer text-zinc-500 hover:text-red-400"
                      onClick={() => removeTag(g, "genres")}
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className="col-span-2 space-y-2">
              <label className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold ml-1">
                Vibes
              </label>
              <input
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none"
                placeholder="Type & press Enter..."
                value={vibeInput}
                onChange={(e) => setVibeInput(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, "vibes")}
              />
              <div className="flex flex-wrap gap-2">
                {newDj.vibes.map((v: string) => (
                  <span
                    key={v}
                    className="flex items-center gap-1 bg-indigo-500/20 text-indigo-300 px-2 py-1 rounded-lg text-[10px] font-bold"
                  >
                    {v}{" "}
                    <X
                      size={12}
                      className="cursor-pointer hover:text-white"
                      onClick={() => removeTag(v, "vibes")}
                    />
                  </span>
                ))}
              </div>
            </div>

            <div className="col-span-2">
              <textarea
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none h-20 resize-none"
                placeholder="Short Bio"
                value={newDj.bio}
                onChange={(e) => setNewDj({ ...newDj, bio: e.target.value })}
              />
            </div>

            {/* --- LOGISTICS SECTION --- */}
            <input
              type="number"
              className="bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none"
              placeholder="Fee (R)"
              value={newDj.fee || ""}
              onChange={(e) =>
                setNewDj({
                  ...newDj,
                  fee: e.target.value === "" ? 0 : Number(e.target.value),
                })
              }
            />

            <select
              className="bg-black border border-zinc-800 p-3 rounded-xl text-sm text-zinc-400 outline-none focus:border-indigo-500"
              value={newDj.experience}
              onChange={(e) =>
                setNewDj({ ...newDj, experience: e.target.value })
              }
            >
              <option value="" disabled>
                Experience
              </option>
              <option value="bedroom">Bedroom</option>
              <option value="regular">Regular</option>
              <option value="pro">Pro</option>
            </select>

            <div className="col-span-2">
              <select
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm text-zinc-400 outline-none focus:border-indigo-500"
                value={newDj.preferredComms}
                onChange={(e) =>
                  setNewDj({ ...newDj, preferredComms: e.target.value })
                }
              >
                <option value="whatsapp">Preferred: WhatsApp</option>
                <option value="IG">Preferred: IG</option>
                <option value="email">Preferred: Email</option>
              </select>
            </div>

            <div className="col-span-2">
              <input
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none"
                placeholder="Mix URL (Soundcloud/Mixcloud)"
                value={newDj.mixUrl}
                onChange={(e) => setNewDj({ ...newDj, mixUrl: e.target.value })}
              />
            </div>

            <div className="col-span-2">
              <input
                className="w-full bg-black border border-zinc-800 p-3 rounded-xl text-sm focus:border-indigo-500 outline-none"
                placeholder="Payment Details (Bank, Branch, Acc #)"
                value={newDj.paymentDetails}
                onChange={(e) =>
                  setNewDj({ ...newDj, paymentDetails: e.target.value })
                }
              />
            </div>

            <div className="col-span-2 pt-2">
              <button
                onClick={handleSave}
                className="w-full bg-indigo-600 py-4 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-indigo-500 shadow-lg shadow-indigo-500/20 transition-all active:scale-[0.98]"
              >
                Add To Vault
              </button>
            </div>
          </div>
        </div>
      )}

      {!showAddForm && (
        <div className="space-y-4">
          <div className="relative mb-6">
            <Search
              className="absolute left-4 top-3.5 text-zinc-500"
              size={18}
            />
            <input
              type="text"
              placeholder="Filter Roster..."
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-12 py-3.5 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {filteredDjs.map((dj) => (
            <div
              key={dj._id}
              className="bg-zinc-900 border border-zinc-800 p-5 rounded-3xl group transition-all duration-300 hover:border-indigo-500/50 hover:shadow-[0_0_20px_rgba(79,70,229,0.15)] hover:-translate-y-1"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tighter italic">
                    {dj.alias}
                  </h3>
                  <div className="flex gap-2 items-center">
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                      {dj.experience}
                    </span>
                    <span className="text-[10px] text-zinc-600">•</span>
                    <span className="text-[10px] text-zinc-500 uppercase">
                      {dj.name} {dj.surname}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <p className="text-green-400 font-mono font-bold text-lg">
                    R{dj.fee}
                  </p>
                  <button
                    onClick={() => handleDelete(dj._id, dj.alias)}
                    className="mt-2 p-2 text-zinc-700 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Tags Section */}
              <div className="flex flex-wrap gap-1 mt-3">
                {dj.genres?.map((g: string) => (
                  <span
                    key={g}
                    className="text-[8px] bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded font-bold uppercase tracking-tighter"
                  >
                    {g}
                  </span>
                ))}
                {dj.vibes?.map((v: string) => (
                  <span
                    key={v}
                    className="text-[8px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded font-bold uppercase tracking-tighter"
                  >
                    #{v}
                  </span>
                ))}
              </div>

              {/* Restored Info Bar */}
              <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-zinc-800/50">
                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                  <Phone size={12} className="text-zinc-600" />
                  <span className="truncate">
                    {dj.contactNumber || "No Contact"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                  <Mail size={12} className="text-zinc-600" />
                  <span className="truncate">{dj.email || "No Email"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Vault;
