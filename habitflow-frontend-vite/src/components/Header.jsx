import { Link, useNavigate } from "react-router-dom";
import { useXp } from "../context/XpContext";
import { useEffect, useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const { xp } = useXp();
  const [name, setName] = useState("");

  // read name from localStorage (you stored it after login)
  useEffect(() => {
    const stored = localStorage.getItem("name");
    if (stored) setName(stored);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    navigate("/login");
  };

  return (
    <header className="bg-indigo-600 text-white py-3 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4">

        {/* Left: Logo */}
        <h1 className="text-xl font-bold">HabitFlow</h1>

        {/* Middle: XP display */}
        <div className="px-3 py-1 bg-white/20 rounded-lg font-semibold text-center">
          ⭐ XP: {xp}
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-6">

          {/* Welcome message */}
          <span className="font-medium">
            👋 Welcome, <span className="font-bold">{name}</span>
          </span>

          {/* Analytics button */}
          <Link
            to="/analytics"
            className="hover:text-gray-200 font-semibold flex items-center gap-1"
          >
            📊 Analytics
          </Link>

          {/* Dashboard */}
          <Link
            to="/dashboard"
            className="hover:text-gray-200 font-semibold"
          >
            Dashboard
          </Link>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="hover:text-gray-200 font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
