import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { eventService, djService } from "../services/api";
import { useAuth } from "../contexts/AuthContext";
import {
  Clock,
  Phone,
  ChevronLeft,
  MapPin,
  Calendar,
  Zap,
  Sparkles,
  Share2,
  Instagram,
  Ticket,
  Edit3,
  Check,
  X,
  DollarSign,
  UserPlus, // Added for Recruitment
  UserMinus, // Added for Decommissioning
  Plus, // Added for Add Button
} from "lucide-react";

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [vaultDjs, setVaultDjs] = useState<any[]>([]); // To hold available DJs

  // --- EDIT STATE ---
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>(null);

  useEffect(() => {
    const getEventDetails = async () => {
      try {
        setLoading(true);
        // Fetching both event and vault data in parallel
        const [eventRes, vaultRes] = await Promise.all([
          eventService.getById(id!),
          djService.getAll(),
        ]);

        if (eventRes.data) {
          setEvent(eventRes.data);
          setEditForm(eventRes.data);
        }
        if (vaultRes.data) {
          setVaultDjs(vaultRes.data);
        }
      } catch (err) {
        console.error("Transmission Error. Signal lost.", err);
      } finally {
        setLoading(false);
      }
    };
    if (id) getEventDetails();
  }, [id]);

  const handleUpdate = async () => {
    try {
      setLoading(true);
      // Recalculate total spend based on the current editForm lineup
      const totalSpend = editForm.djLineup.reduce(
        (acc: number, curr: any) =>
          acc + (Number(curr.finalFee) || Number(curr.fee) || 0),
        0,
      );

      const updatedPayload = { ...editForm, event_dj_total_price: totalSpend };
      await eventService.update(id!, updatedPayload);
      setEvent(updatedPayload);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update mission parameters.");
    } finally {
      setLoading(false);
    }
  };

  const updateLineupSlot = (idx: number, field: string, value: any) => {
    const newLineup = [...editForm.djLineup];
    newLineup[idx] = { ...newLineup[idx], [field]: value };
    setEditForm({ ...editForm, djLineup: newLineup });
  };

  // --- NEW: ADD/REMOVE LOGIC ---
  const addDjToLineup = (dj: any) => {
    const newSlot = {
      djId: dj._id,
      artistAlias: dj.alias,
      name: `${dj.name} ${dj.surname}`,
      phone: dj.contactNumber,
      instagram: dj.igLink,
      genres: dj.genres,
      fee: dj.fee,
      finalFee: dj.fee,
      time: "TBA - TBA",
    };
    setEditForm({ ...editForm, djLineup: [...editForm.djLineup, newSlot] });
  };

  const removeDjFromLineup = (idx: number) => {
    const newLineup = editForm.djLineup.filter(
      (_: any, i: number) => i !== idx,
    );
    setEditForm({ ...editForm, djLineup: newLineup });
  };

  const shareToWhatsApp = () => {
    if (!event) return;
    const lineupString = event.djLineup
      .map((slot: any) => `▪️ *${slot.time}*: ${slot.artistAlias || "TBA"}`)
      .join("\n");

    const message = encodeURIComponent(
      `🛸 *GROOVE OPS: MISSION BRIEFING*\n\n` +
        `📅 *DATE:* ${new Date(event.date).toDateString()}\n` +
        `📍 *LOCATION:* ${event.location}\n` +
        `📋 *EVENT:* ${event.name}\n\n` +
        `*LINEUP DEPLOYMENT:*\n${lineupString}\n\n` +
        `_Please confirm your arrival 15 mins before your set._`,
    );
    window.open(`https://wa.me/?text=${message}`, "_blank");
  };

  if (loading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-indigo-500 animate-pulse">
        <Sparkles size={48} className="mb-4" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em]">
          Decrypting Operation Logs...
        </span>
      </div>
    );

  if (!event) return <div className="p-10 text-white">Event not found.</div>;

  return (
    <div className="p-4 max-w-md mx-auto pb-24 text-white animate-in fade-in duration-500">
      {/* Navigation Header */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-zinc-500 hover:text-white transition-all group"
        >
          <ChevronLeft
            size={20}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-[10px] font-black uppercase tracking-widest">
            Archive Center
          </span>
        </button>

        {/* Edit Button - Only for Admin and Event Creator (Organiser) */}
        {role &&
          (role === "Admin" ||
            (role === "Organiser" && event?.createdBy === user?.uid)) && (
            <button
              onClick={() => {
                if (isEditing) setEditForm(event);
                setIsEditing(!isEditing);
              }}
              className={`p-2 rounded-xl transition-all ${isEditing ? "bg-red-500/20 text-red-400" : "bg-zinc-900 text-zinc-500 hover:text-indigo-400"}`}
            >
              {isEditing ? <X size={18} /> : <Edit3 size={18} />}
            </button>
          )}
      </div>

      {/* HERO SECTION */}
      <div
        className={`bg-gradient-to-br ${isEditing ? "from-orange-500 to-red-600" : "from-indigo-600 via-indigo-700 to-indigo-900"} p-[1px] rounded-[2.5rem] mb-8 shadow-2xl`}
      >
        <div className="bg-zinc-950/40 backdrop-blur-xl rounded-[2.45rem] p-8 relative overflow-hidden">
          <div className="relative z-10">
            {isEditing ? (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-orange-400 mb-2">
                  <Zap size={14} className="animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Manual Override Active
                  </span>
                </div>
                <input
                  className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-2xl font-black uppercase italic outline-none focus:border-orange-500"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                />
                <input
                  className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-xs outline-none"
                  value={editForm.location}
                  onChange={(e) =>
                    setEditForm({ ...editForm, location: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="date"
                    className="bg-black/40 border border-white/10 p-3 rounded-xl text-xs"
                    value={editForm.date?.split("T")[0]}
                    onChange={(e) =>
                      setEditForm({ ...editForm, date: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    className="bg-black/40 border border-white/10 p-3 rounded-xl text-xs"
                    value={editForm.eventFee}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        eventFee: Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-4">
                  {event.name}
                </h1>
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-1.5 text-indigo-200 text-[10px] font-bold uppercase tracking-wide bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <MapPin size={12} />{" "}
                    <span className="truncate">
                      {event.location?.split(",")[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-200 text-[10px] font-bold uppercase tracking-wide bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    <Calendar size={12} /> {new Date(event.date).toDateString()}
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mb-6">
                  <div className="flex items-center gap-2 text-green-400 bg-green-500/10 w-fit px-3 py-1 rounded-lg border border-green-500/20">
                    <Ticket size={14} />
                    <span className="text-xs font-black uppercase tracking-tighter">
                      Entry:{" "}
                      {event.eventFee > 0 ? `R${event.eventFee}` : "Free Entry"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400 bg-green-500/10 w-fit px-3 py-1 rounded-lg border border-green-500/20">
                    <p className="text-xs text-zinc-300 leading-relaxed italic opacity-80">
                      {event.description || "No mission description provided."}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-50 text-white">
                      Artist Spend
                    </p>
                    <p className="text-2xl font-mono font-black text-green-400">
                      R{event.event_dj_total_price?.toLocaleString()}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest opacity-50 text-white">
                      Lineup
                    </p>
                    <p className="text-2xl font-mono font-black text-white">
                      {event.djLineup?.length}{" "}
                      <span className="text-xs uppercase italic text-zinc-400">
                        Artists
                      </span>
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
          <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl" />
        </div>
      </div>

      {/* LINEUP LIST */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-2 mb-2">
          <h2 className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
            Deployment Schedule
          </h2>
          {isEditing && (
            <span className="text-orange-500 text-[8px] font-black uppercase animate-pulse">
              Live Editing
            </span>
          )}
        </div>

        {(isEditing ? editForm.djLineup : event.djLineup)?.map(
          (slot: any, idx: number) => (
            <div
              key={idx}
              className={`bg-zinc-900/30 border ${isEditing ? "border-orange-500/30 shadow-orange-500/5" : "border-zinc-800/50 shadow-xl"} rounded-3xl p-5 flex flex-col gap-4 group transition-all border-l-4 border-l-indigo-500 relative`}
            >
              {/* DELETE BUTTON - ONLY IN EDIT MODE FOR NON-ARTISTS */}
              {isEditing &&
                role &&
                (role === "Admin" || role === "Organiser") && (
                  <button
                    onClick={() => removeDjFromLineup(idx)}
                    className="absolute -top-2 -right-2 bg-red-600 text-white p-2 rounded-full shadow-lg active:scale-90 z-20"
                  >
                    <UserMinus size={14} />
                  </button>
                )}

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-12 h-12 rounded-2xl bg-black border border-zinc-800 flex flex-col items-center justify-center">
                    {isEditing ? (
                      <Clock size={16} className="text-orange-500" />
                    ) : (
                      <>
                        <span className="text-[10px] font-mono font-bold text-indigo-500 leading-none">
                          {slot.time.split(" - ")[0]}
                        </span>
                        <Clock size={10} className="text-zinc-600 mt-1" />
                      </>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-black italic uppercase text-xl text-white">
                      {slot.artistAlias}
                    </h4>
                    {isEditing ? (
                      <input
                        className="w-full bg-black/60 border border-zinc-800 mt-1 p-2 rounded-lg text-[10px] font-bold text-indigo-400 outline-none focus:border-indigo-500"
                        value={slot.time}
                        onChange={(e) =>
                          updateLineupSlot(idx, "time", e.target.value)
                        }
                        placeholder="e.g. 22:00 - 23:30"
                      />
                    ) : (
                      <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tight">
                        {slot.name || "Legal Name Not Listed"}
                      </p>
                    )}
                  </div>
                </div>

                {!isEditing && (
                  <div className="flex gap-2">
                    <a
                      href={`tel:${slot.phone}`}
                      className="bg-zinc-800/80 p-2.5 rounded-xl hover:bg-indigo-600 transition-all border border-zinc-700"
                    >
                      <Phone size={16} />
                    </a>
                    <a
                      href={
                        slot.instagram
                          ? `https://instagram.com/${slot.instagram.replace("@", "")}`
                          : "#"
                      }
                      target="_blank"
                      rel="noreferrer"
                      className="bg-zinc-800/80 p-2.5 rounded-xl hover:bg-pink-600 transition-all border border-zinc-700"
                    >
                      <Instagram size={16} />
                    </a>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between border-t border-zinc-800/50 pt-3">
                <div className="flex flex-wrap gap-1.5">
                  {slot.genres?.slice(0, 2).map((g: string, i: number) => (
                    <span
                      key={i}
                      className="text-[8px] font-black uppercase tracking-widest bg-indigo-500/10 text-indigo-400/80 px-2 py-0.5 rounded-md border border-indigo-500/10"
                    >
                      {g}
                    </span>
                  ))}
                </div>

                {/* Hide fee display for artists */}
                {role && (role === "Admin" || role === "Organiser") && (
                  <>
                    {isEditing ? (
                      <div className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-xl border border-zinc-800">
                        <DollarSign size={10} className="text-green-500" />
                        <input
                          type="number"
                          className="w-16 bg-transparent text-right font-mono font-bold text-green-500 text-xs outline-none"
                          value={slot.finalFee || slot.fee}
                          onChange={(e) =>
                            updateLineupSlot(
                              idx,
                              "finalFee",
                              Number(e.target.value),
                            )
                          }
                        />
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-green-500 bg-green-500/5 px-2 py-0.5 rounded-md">
                        R{slot.finalFee || slot.fee}
                      </span>
                    )}
                  </>
                )}
              </div>
            </div>
          ),
        )}

        {/* RECRUITMENT DRAWER - ONLY IN EDIT MODE FOR NON-ARTISTS */}
        {isEditing && role && (role === "Admin" || role === "Organiser") && (
          <div className="mt-8 pt-6 border-t border-zinc-800/50 animate-in slide-in-from-bottom-4 duration-500">
            <h3 className="text-[10px] font-black uppercase text-orange-400 mb-4 flex items-center gap-2">
              <UserPlus size={14} /> Available Assets In Vault
            </h3>
            <div className="space-y-2 overflow-y-auto max-h-60 pr-2 custom-scrollbar">
              {vaultDjs
                .filter(
                  (vdj) =>
                    !editForm.djLineup.some((s: any) => s.djId === vdj._id),
                )
                .map((dj) => (
                  <button
                    key={dj._id}
                    onClick={() => addDjToLineup(dj)}
                    className="w-full flex justify-between items-center bg-black/20 p-4 rounded-2xl border border-zinc-800 hover:border-indigo-500 hover:bg-indigo-500/5 transition-all text-left group"
                  >
                    <div>
                      <p className="text-xs font-black uppercase italic group-hover:text-indigo-400 transition-colors">
                        {dj.alias}
                      </p>
                      <p className="text-[8px] text-zinc-500 uppercase tracking-widest">
                        {dj.genres?.slice(0, 2).join(" / ")}
                      </p>
                    </div>
                    <Plus
                      size={16}
                      className="text-indigo-500 group-hover:rotate-90 transition-transform"
                    />
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* COMMIT ACTIONS */}
      {isEditing && (
        <div className="mt-8">
          <button
            onClick={handleUpdate}
            className="w-full bg-indigo-600 text-white py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-indigo-500 transition-all active:scale-[0.98] shadow-xl shadow-indigo-900/40"
          >
            <Check size={18} />
            <span className="text-xs font-black uppercase tracking-widest">
              Deploy Re-calibration
            </span>
          </button>
        </div>
      )}

      {/* FOOTER ACTIONS */}
      {!isEditing && (
        <div className="mt-8">
          <button
            onClick={shareToWhatsApp}
            className="w-full bg-green-500/10 border border-green-500/30 text-green-400 py-5 rounded-[2rem] flex items-center justify-center gap-3 hover:bg-green-500/20 transition-all"
          >
            <Share2 size={18} />
            <span className="text-xs font-black uppercase tracking-widest">
              SHARE OPERATION
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default EventDetails;
