import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, Globe, LogOut, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const NAV = [
  { label: "Dashboard", path: "/" },
  { label: "Map", path: "/transparency" },
  { label: "Reports", path: "/reports" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const loc = useLocation();

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-14 gap-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 mr-4 flex-shrink-0">
          <div className="w-7 h-7 bg-navy-800 rounded flex items-center justify-center">
            <span className="text-white text-xs font-bold">C</span>
          </div>
          <span className="font-display font-bold text-navy-900 text-sm hidden sm:block">
            The Civil Dialogue
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1 flex-1">
          {NAV.map((n) => (
            <Link
              key={n.path}
              to={n.path}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                loc.pathname === n.path
                  ? "text-navy-800 border-b-2 border-navy-800 rounded-none pb-[14px]"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors">
            <Globe size={17} />
          </button>
          <button className="p-1.5 text-gray-500 hover:text-gray-700 transition-colors relative">
            <Bell size={17} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-navy-100 rounded-full flex items-center justify-center">
              <User size={15} className="text-navy-700" />
            </div>
            <button
              onClick={logout}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
              title="Sign out"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
