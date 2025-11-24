import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import Header from "../components/Header";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

export default function AnalyticsDashboard() {
  const [overview, setOverview] = useState(null);
  const [daily, setDaily] = useState([]);
  const [weeklyXp, setWeeklyXp] = useState([]);
  const [topHabits, setTopHabits] = useState([]);

  const fetchAll = async () => {
    try {
      const o = await axiosInstance.get("/analytics/overview");
      setOverview(o.data);

      const d = await axiosInstance.get("/analytics/habits/daily?days=30");
      setDaily(d.data.days);

      const w = await axiosInstance.get("/analytics/xp/weekly?weeks=8");
      setWeeklyXp(w.data.weeks);

      const t = await axiosInstance.get("/analytics/top-habits?limit=5");
      setTopHabits(t.data.top);
    } catch (err) {
      console.error(err);
      alert("Failed to load analytics");
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-6xl mx-auto p-6 space-y-6">

        {/* Overview */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">Total Habits</div>
            <div className="text-2xl font-bold">{overview?.totalHabits ?? 0}</div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">Active Challenges</div>
            <div className="text-2xl font-bold">{overview?.activeChallenges ?? 0}</div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">Total XP</div>
            <div className="text-2xl font-bold">{overview?.totalXP ?? 0}</div>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <div className="text-sm text-gray-500">Current Streak</div>
            <div className="text-2xl font-bold">{overview?.currentStreak ?? 0} days</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">

          {/* Habit Completions */}
          <div className="bg-white p-4 rounded shadow h-96 w-full min-w-0">
            <h3 className="font-semibold mb-2">Habit Completions (Last 30 Days)</h3>

            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#4F46E5" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* XP Weekly */}
          <div className="bg-white p-4 rounded shadow h-96 w-full min-w-0">
            <h3 className="font-semibold mb-2">XP Gained (Last 8 Weeks)</h3>

            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={weeklyXp}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="weekStart" tickFormatter={(d) => d.slice(5)} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="xp" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Habits */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">Top Habits</h3>
          <ul className="space-y-2">
            {topHabits.length === 0 && <div className="text-gray-500">No data</div>}

            {topHabits.map((h) => (
              <li key={h.id} className="flex justify-between">
                <div>{h.title}</div>
                <div className="font-semibold">{h.count}</div>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
