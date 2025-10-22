import { Link, useNavigate } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <header className="bg-indigo-600 text-white py-3 shadow-md">
      <div className="max-w-6xl mx-auto flex justify-between items-center px-4">
        <h1 className="text-xl font-bold">HabitFlow</h1>
        <nav className="space-x-4">
          <Link to="/dashboard" className="hover:text-gray-200">Dashboard</Link>
          <button
            onClick={handleLogout}
            className="hover:text-gray-200"
          >
            Logout
          </button>
        </nav>
      </div>
    </header>
  );
}
