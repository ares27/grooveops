import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { djService } from "../services/api";
import InviteArtistModal from "../components/InviteArtistModal";
import {
  Search,
  Phone,
  Trash2,
  Mail,
  ChevronDown,
  UserPlus,
} from "lucide-react";

const Vault = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [djs, setDjs] = useState<any[]>([]);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [expandedTags, setExpandedTags] = useState<
    Record<string, { genres: boolean; vibes: boolean }>
  >({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchDjs = () => {
    setLoading(true);
    djService.getAll().then((res) => {
      setDjs(res.data);
      setLoading(false);
    });
  };

  const toggleTagExpansion = (djId: string, field: "genres" | "vibes") => {
    setExpandedTags((prev) => ({
      ...prev,
      [djId]: {
        ...prev[djId],
        [field]: !prev[djId]?.[field],
      },
    }));
  };

  useEffect(() => {
    fetchDjs();
  }, []);

  const handleDelete = async (id: string, alias: string) => {
    if (window.confirm(`Remove ${alias} from the Vault?`)) {
      try {
        await djService.delete(id);
        // Immediately remove from state to prevent stale data
        setDjs(djs.filter((dj) => dj._id !== id));
      } catch (err) {
        alert("Error deleting artist.");
      }
    }
  };

  const filteredDjs = djs.filter((dj) =>
    dj.alias?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="p-10 text-indigo-500 font-mono text-[10px] animate-pulse">
        ACCESSING_ENCRYPTED_ARTIST_VAULT...
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
            Official Artist Roster
          </p>
        </div>
        <div className="flex gap-2">
          {role === "Organiser" && (
            <button
              onClick={() => setShowInviteModal(true)}
              className="p-3 rounded-2xl transition-all active:scale-90 bg-green-600 text-white shadow-lg shadow-green-500/20 hover:bg-green-700"
              title="Invite New Artist"
            >
              <UserPlus size={24} strokeWidth={3} />
            </button>
          )}
        </div>
      </header>

      <InviteArtistModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSuccess={() => fetchDjs()}
      />

      <div className="space-y-4">
        <div className="relative mb-8 group">
          <Search
            className="absolute left-4 top-4 text-zinc-600 group-focus-within:text-indigo-500 transition-colors"
            size={20}
          />
          <input
            type="text"
            placeholder="Search roster..."
            className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl px-12 py-4 focus:ring-2 focus:ring-indigo-500 outline-none transition-all text-sm font-bold shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="space-y-4">
          {filteredDjs.map((dj) => (
            <div
              key={dj._id}
              onClick={() => navigate(`/artist/${dj._id}`)}
              className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2.5rem] group transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 cursor-pointer"
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

              <div className="space-y-3 mt-5">
                {/* Genres Section */}
                <div>
                  <div className="flex flex-wrap gap-1.5">
                    {dj.genres?.slice(0, 5).map((g: string) => (
                      <span
                        key={g}
                        className="text-[8px] bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-md font-black uppercase tracking-widest border border-zinc-800/50"
                      >
                        {g}
                      </span>
                    ))}
                    {expandedTags[dj._id!]?.genres &&
                      dj.genres?.slice(5).map((g: string) => (
                        <span
                          key={g}
                          className="text-[8px] bg-zinc-800 text-zinc-400 px-2.5 py-1 rounded-md font-black uppercase tracking-widest border border-zinc-800/50"
                        >
                          {g}
                        </span>
                      ))}
                  </div>
                  {dj.genres && dj.genres.length > 5 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTagExpansion(dj._id!, "genres");
                      }}
                      className="text-[8px] text-indigo-400 font-bold mt-2 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      {expandedTags[dj._id!]?.genres ? (
                        <>
                          Show less{" "}
                          <ChevronDown size={10} className="rotate-180" />
                        </>
                      ) : (
                        <>
                          +{dj.genres.length - 5} more <ChevronDown size={10} />
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Vibes Section */}
                <div>
                  <div className="flex flex-wrap gap-1.5">
                    {dj.vibes?.slice(0, 5).map((v: string) => (
                      <span
                        key={v}
                        className="text-[8px] bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md font-black uppercase tracking-widest border border-indigo-500/20"
                      >
                        #{v}
                      </span>
                    ))}
                    {expandedTags[dj._id!]?.vibes &&
                      dj.vibes?.slice(5).map((v: string) => (
                        <span
                          key={v}
                          className="text-[8px] bg-indigo-500/10 text-indigo-400 px-2.5 py-1 rounded-md font-black uppercase tracking-widest border border-indigo-500/20"
                        >
                          #{v}
                        </span>
                      ))}
                  </div>
                  {dj.vibes && dj.vibes.length > 5 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTagExpansion(dj._id!, "vibes");
                      }}
                      className="text-[8px] text-indigo-400 font-bold mt-2 hover:text-indigo-300 transition-colors flex items-center gap-1"
                    >
                      {expandedTags[dj._id!]?.vibes ? (
                        <>
                          Show less{" "}
                          <ChevronDown size={10} className="rotate-180" />
                        </>
                      ) : (
                        <>
                          +{dj.vibes.length - 5} more <ChevronDown size={10} />
                        </>
                      )}
                    </button>
                  )}
                </div>
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
    </div>
  );
};

export default Vault;
