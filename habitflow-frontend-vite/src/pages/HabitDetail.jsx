import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Header from "../components/Header";
import Loader from "../components/Loader";
import dayjs from "dayjs";

export default function HabitDetail() {
  const { id } = useParams();
  const [habit, setHabit] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tracking, setTracking] = useState(false);
  const [completedToday, setCompletedToday] = useState(false);

  // Fetch habit + history
  const fetchHabitDetail = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/habits/${id}`);
      setHabit(data);

      // Fetch history
      const res = await axiosInstance.get(`/habits/${id}/history`);
      setHistory(res.data.history);

      // Check if today is completed
      const today = dayjs().startOf("day");
      if (res.data.history.some((h) => dayjs(h.date).isSame(today, "day") && h.completed)) {
        setCompletedToday(true);
      }
    } catch (err) {
      alert("Failed to load habit details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabitDetail();
  }, [id]);

  const handleTrack = async () => {
    if (completedToday) return;
    setTracking(true);
    try {
      await axiosInstance.post(`/habits/${id}/track`);
      setCompletedToday(true);
      fetchHabitDetail(); // refresh streak and history
    } catch (err) {
      alert(err.response?.data?.message || "Failed to track habit");
    } finally {
      setTracking(false);
    }
  };

  if (loading) return <Loader />;
  if (!habit) return <p className="text-center mt-10">Habit not found</p>;

  return (
    <div className="bg-gray-100 min-h-screen">
      <Header />
      <div className="max-w-4xl mx-auto p-6">
        {/* Habit Info Card */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-3xl font-bold text-indigo-600 mb-2">{habit.title}</h1>
          {habit.description && (
            <p className="text-gray-700 mb-4">{habit.description}</p>
          )}
          <div className="flex flex-wrap gap-4 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Frequency: {habit.frequency}
            </span>
            {habit.tags?.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-6">
            <p className="text-gray-500">Current Streak: {habit.currentStreak} days</p>
            <p className="text-gray-500">Longest Streak: {habit.longestStreak || 0} days</p>
            <button
              onClick={handleTrack}
              disabled={completedToday || tracking}
              className={`px-4 py-2 rounded text-white ${
                completedToday || tracking
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {completedToday ? "Done Today" : tracking ? "Tracking..." : "Mark Done"}
            </button>
          </div>
        </div>

        {/* 7-day Completion History */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Last 7 Days</h2>
          <div className="grid grid-cols-7 gap-2">
            {history.map((h, idx) => {
              const dayName = dayjs(h.date).format("ddd");
              return (
                <div
                  key={idx}
                  className={`flex flex-col items-center p-2 rounded ${
                    h.completed ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <span className="text-sm font-semibold">{dayName}</span>
                  <span className="text-lg font-bold">
                    {h.completed ? "✔" : "✕"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
