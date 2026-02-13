import { Link, useLocation } from "react-router-dom";

const BottomNav = () => {
  const location = useLocation();

  const navItems = [
    { name: "Home", path: "/", icon: "🏠" },
    { name: "Lineup", path: "/lineup/new", icon: "📅" },
    { name: "Vault", path: "/vault", icon: "📁" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-950/80 backdrop-blur-md border-t border-zinc-800 px-6 py-3">
      <div className="flex justify-around items-center max-w-md mx-auto">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center transition-colors ${
              location.pathname === item.path
                ? "text-indigo-500"
                : "text-zinc-500"
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-medium mt-1">{item.name}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
