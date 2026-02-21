import { Link, useLocation } from "react-router-dom";
import { LayoutDashboard, PlusSquare, Database } from "lucide-react";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "Deploy", path: "/lineup/new", icon: PlusSquare },
    { name: "Vault", path: "/vault", icon: Database },
  ];

  return (
    <nav className="fixed bottom-6 left-4 right-4 z-50">
      <div className="max-w-md mx-auto bg-zinc-950/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-2 shadow-2xl shadow-black/50">
        <div className="flex justify-around items-center px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative py-3 px-5 flex flex-col items-center group transition-all"
              >
                {/* Active Indicator Glow */}
                {isActive && (
                  <div className="absolute inset-0 bg-indigo-500/10 rounded-2xl blur-md" />
                )}

                <Icon
                  size={20}
                  className={`relative z-10 transition-all duration-300 ${
                    isActive
                      ? "text-indigo-400 scale-110"
                      : "text-zinc-500 group-hover:text-zinc-300"
                  }`}
                />

                <span
                  className={`relative z-10 text-[9px] font-black uppercase tracking-[0.15em] mt-1.5 transition-colors duration-300 ${
                    isActive
                      ? "text-white"
                      : "text-zinc-600 group-hover:text-zinc-400"
                  }`}
                >
                  {item.name}
                </span>

                {/* Bottom Active Dot */}
                {isActive && (
                  <div className="absolute -bottom-1 w-1 h-1 bg-indigo-500 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
