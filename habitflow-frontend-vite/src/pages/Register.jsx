import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axiosInstance.post("/auth/register", form);

      // ⭐ Auto-login after registration
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.user.name);

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 to-indigo-300">
      {/* Illustration */}
      <div className="hidden md:flex w-1/2 items-center justify-center">
        <img
          src="/images/habitquotes-removebg-preview.png"
          alt="Habit Motivation"
          className="rounded-xl shadow-lg"
        />
      </div>

      {/* Registration Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-5"
        >
          <h2 className="text-3xl font-bold text-indigo-600 text-center mb-2">
            Create Account
          </h2>

          <input
            type="text"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 border rounded-xl focus:ring-indigo-400"
          />

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-3 border rounded-xl focus:ring-indigo-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 border rounded-xl focus:ring-indigo-400"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-xl text-white ${
              loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Creating Account..." : "Register"}
          </button>

          <p className="text-center text-gray-500 mt-2">
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="text-indigo-600 hover:underline font-medium"
            >
              Login
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
