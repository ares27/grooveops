import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, PlusSquare, Database, LogOut, User } from "lucide-react";
import { useAuth, type UserRole } from "../contexts/AuthContext";

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<any>;
  requiredRole?: UserRole[];
}

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role, signOut } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems: NavItem[] = [
    { name: "Dashboard", path: "/", icon: LayoutDashboard },
    { name: "New Op", path: "/lineup/new", icon: PlusSquare, requiredRole: ["Admin", "Organiser"] },
    { name: "Vault", path: "/vault", icon: Database },
  ];

  // Filter nav items based on role
  const filteredNavItems = navItems.filter(
    (item) => !item.requiredRole || (role && item.requiredRole.includes(role)),
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/login");
    } catch (error) {
      console.error("Sign out failed:", error);
    }
  };

  return (
    <>
      {/* User Menu */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="bg-zinc-900/80 backdrop-blur-xl border border-zinc-800/50 rounded-full p-2 hover:border-indigo-500/50 transition-all"
        >
          <User size={20} className="text-indigo-400" />
        </button>

        {showUserMenu && (
          <div className="absolute top-12 right-0 bg-zinc-900/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl w-56 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-4 space-y-3">
              {/* User Info */}
              <div className="pb-3 border-b border-zinc-800/50">
                <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">
                  Logged In As
                </p>
                <p className="text-sm font-black text-white mt-1">
                  {user?.displayName || user?.email}
                </p>
                <p className="text-[9px] text-indigo-400 font-bold mt-1 uppercase">
                  {role}
                </p>
              </div>

              {/* Sign Out Button */}
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 text-red-500 hover:text-red-400 font-black text-[10px] uppercase tracking-widest py-2 px-3 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <LogOut size={14} />
                SIGN OUT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-4 right-4 z-40">
        <div className="max-w-md mx-auto bg-zinc-950/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-2 shadow-2xl shadow-black/50">
          <div className="flex justify-around items-center px-2">
            {filteredNavItems.map((item) => {
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
    </>
  );
};

export default BottomNav;
