import { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await axiosInstance.post("/auth/login", form);

      // ⭐ Save token + name
      localStorage.setItem("token", data.token);
      localStorage.setItem("name", data.user.name);
      localStorage.setItem("profilePic", data.user.profilePic || "");

      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Demo credentials
  const demoEmail = "demo@habitflow.com";
  const demoPassword = "Demo@123";

  const fillDemoCredentials = () => {
    setForm({ email: demoEmail, password: demoPassword });
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-100 to-indigo-300">
      {/* Left Image */}
      <div className="hidden md:flex w-1/2 items-center justify-center">
        <img
          src="/images/habitquotes-removebg-preview.png"
          alt="Motivation"
          className="rounded-xl shadow-lg"
        />
      </div>

      {/* Login Form */}
      <div className="flex flex-1 items-center justify-center p-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md flex flex-col gap-5"
        >
          <h2 className="text-3xl font-bold text-indigo-600 text-center mb-2">
            Welcome Back
          </h2>

          <input
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400"
          />

          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-indigo-400"
          />

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 rounded-xl text-white font-semibold ${
              loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Demo Credentials */}
          <div className="mt-4 p-4 bg-indigo-50 rounded-xl border border-indigo-200 text-sm">
            <p className="font-semibold text-indigo-700 text-center mb-2">
              Demo Login
            </p>

            <p><strong>Email:</strong> {demoEmail}</p>
            <p><strong>Password:</strong> {demoPassword}</p>

            <button
              type="button"
              onClick={fillDemoCredentials}
              className="mt-3 w-full py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-100"
            >
              Autofill Demo Credentials
            </button>
          </div>

          <p className="text-center text-gray-500 mt-2">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-indigo-600 hover:underline font-medium"
            >
              Register
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}
