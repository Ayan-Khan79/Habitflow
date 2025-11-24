import { Link, useNavigate } from "react-router-dom";
import { useXp } from "../context/XpContext";
import { useEffect, useState } from "react";

export default function Header() {
  const navigate = useNavigate();
  const { xp } = useXp();
  const [name, setName] = useState("");
  const [pic, setPic] = useState("");
  const [open, setOpen] = useState(false);

  const defaultPic = "https://i.ibb.co/2k5Y4jF/default-avatar.png";

  useEffect(() => {
    const storedName = localStorage.getItem("name");
    const storedPic = localStorage.getItem("profilePic");

    if (storedName) setName(storedName);
    setPic(storedPic || defaultPic);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("profilePic");
    navigate("/login");
  };

  return (
    <header className="bg-indigo-600 text-white py-3 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4">

        {/* Left: Logo */}
        <h1 className="text-xl font-bold">HabitFlow</h1>

        {/* Center: XP */}
        <div className="px-3 py-1 bg-white/20 rounded-lg font-semibold text-center">
          ⭐ XP: {xp}
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-6 relative">

          {/* Dashboard */}
          <Link
            to="/dashboard"
            className="hover:text-gray-200 font-semibold"
          >
            Dashboard
          </Link>

          {/* Analytics */}
          <Link
            to="/analytics"
            className="hover:text-gray-200 font-semibold flex items-center gap-1"
          >
            📊 Analytics
          </Link>

          {/* Profile Dropdown Trigger */}
          <div className="relative">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center gap-2 hover:opacity-90"
            >
              <img
                src={pic}
                className="w-10 h-10 rounded-full border border-white object-cover"
                alt="profile"
              />
              <span className="font-medium">
                👋 Welcome, <span className="font-bold">{name}</span>
              </span>
              <span className="text-sm">▼</span>
            </button>

            {/* Dropdown Menu */}
            {open && (
              <div className="absolute right-0 mt-2 bg-white text-gray-800 rounded-lg shadow-lg w-40 z-50">
                <Link
                  to="/profile"
                  onClick={() => setOpen(false)}
                  className="block px-4 py-2 hover:bg-gray-100"
                >
                  Profile
                </Link>

                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
