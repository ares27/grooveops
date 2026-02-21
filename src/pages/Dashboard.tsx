import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { djService, eventService } from "../services/api";
import {
  Calendar,
  MapPin,
  ArrowRight,
  Users,
  Plus,
  Zap,
  TrendingUp,
  DollarSign,
} from "lucide-react";

const Dashboard = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState({
    djCount: 0,
    eventCount: 0,
    totalSpend: 0,
  });
  const [loading, setLoading] = useState(true);

  // SURPRISE: Monthly Budget Goal (Could be dynamic later)
  const MONTHLY_CAP = 50000;

  useEffect(() => {
    Promise.all([djService.getAll(), eventService.getAll()])
      .then(([djs, evs]) => {
        const totalSpend = evs.data.reduce(
          (sum: number, e: any) => sum + (e.totalBudget || 0),
          0,
        );
        setStats({
          djCount: djs.data.length,
          eventCount: evs.data.length,
          totalSpend: totalSpend,
        });
        // Sort by date and take top 3
        const sorted = evs.data.sort(
          (a: any, b: any) =>
            new Date(a.date).getTime() - new Date(b.date).getTime(),
        );
        setEvents(sorted.slice(0, 3));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Data fetch error", err);
        setLoading(false);
      });
  }, []);

  const burnRate = Math.min((stats.totalSpend / MONTHLY_CAP) * 100, 100);

  return (
    <div className="p-6 max-w-md mx-auto pb-24 text-white font-sans selection:bg-indigo-500">
      {/* Brand Header */}
      <header className="mb-8 mt-4 flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black tracking-tighter italic leading-none">
            GROOVE
            <span className="text-indigo-500 underline decoration-indigo-500/30">
              OPS
            </span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em] mt-2">
            Sector 01 • Operations
          </p>
        </div>
        <div className="bg-zinc-900 p-2 rounded-full border border-zinc-800">
          <Zap size={16} className="text-yellow-500 fill-yellow-500" />
        </div>
      </header>

      {/* SURPRISE 1: FINANCIAL BURN RATE */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 mb-6">
        <div className="flex justify-between items-end mb-3">
          <div>
            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
              Artist Spend
            </p>
            <p className="text-2xl font-bold">
              R{stats.totalSpend.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-indigo-400 text-xs font-bold">
              {Math.round(burnRate)}% of Cap
            </p>
          </div>
        </div>
        <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-600 to-fuchsia-500 transition-all duration-1000 shadow-[0_0_10px_rgba(79,70,229,0.5)]"
            style={{ width: `${burnRate}%` }}
          />
        </div>
      </div>

      {/* Primary Action Card */}
      <Link
        to="/lineup/new"
        className="relative block overflow-hidden bg-indigo-600 rounded-3xl p-6 mb-8 group active:scale-[0.98] transition-all"
      >
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-white text-xl font-bold">New Mission</h2>
            <TrendingUp size={16} className="text-indigo-200" />
          </div>
          <p className="text-indigo-100 text-xs mb-5 opacity-70">
            Assemble a lineup and deploy logistics.
          </p>
          <div className="flex items-center gap-2 bg-white text-indigo-600 w-fit px-4 py-2 rounded-xl font-black text-xs uppercase tracking-tight group-hover:gap-4 transition-all">
            Initialize <ArrowRight size={14} />
          </div>
        </div>
        {/* Decorative element */}
        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-black/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
      </Link>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col items-center text-center">
          <Users size={16} className="text-zinc-600 mb-2" />
          <p className="text-2xl font-black italic">{stats.djCount}</p>
          <p className="text-[9px] text-zinc-500 font-bold uppercase">Agents</p>
        </div>
        <div className="bg-zinc-900/50 border border-zinc-800 p-4 rounded-2xl flex flex-col items-center text-center">
          <Calendar size={16} className="text-zinc-600 mb-2" />
          <p className="text-2xl font-black italic">{stats.eventCount}</p>
          <p className="text-[9px] text-zinc-500 font-bold uppercase">
            Deployments
          </p>
        </div>
      </div>

      {/* Upcoming Events */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4 px-1">
          <h3 className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
            Active Deployments
          </h3>
          <Link
            to="/events"
            className="text-indigo-400 text-[10px] font-black uppercase hover:underline"
          >
            Log History
          </Link>
        </div>

        <div className="space-y-3">
          {loading
            ? [1, 2].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-zinc-900 rounded-3xl animate-pulse"
                />
              ))
            : events.map((event) => {
                const isToday =
                  new Date(event.date).toDateString() ===
                  new Date().toDateString();
                return (
                  <div
                    key={event._id}
                    className="bg-zinc-900 border border-zinc-800 p-4 rounded-3xl relative overflow-hidden group"
                  >
                    {isToday && (
                      <div className="absolute top-0 right-0 p-2">
                        <span className="flex h-2 w-2 rounded-full bg-red-500 animate-ping" />
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-black text-sm uppercase tracking-tight italic group-hover:text-indigo-400 transition-colors">
                          {event.name}
                        </h4>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-500 mt-2 font-bold">
                          <span className="bg-zinc-800 px-2 py-1 rounded-md">
                            {event.location}
                          </span>
                          <span>
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-mono font-bold text-zinc-400">
                          R{event.totalBudget?.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
