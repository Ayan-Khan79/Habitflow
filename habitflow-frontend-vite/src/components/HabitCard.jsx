import axiosInstance from "../api/axiosInstance";
import { Trash2 } from "lucide-react"; // Using lucide-react icon

export default function HabitCard({ habit, refreshHabits }) {
  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${habit.title}"?`)) return;
    try {
      await axiosInstance.delete(`/habits/${habit.id}`);
      refreshHabits();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete habit");
    }
  };

  return (
    <div className="relative bg-white rounded-xl shadow-md p-4 hover:shadow-xl hover:scale-105 transition transform">
      {/* Delete Icon */}
      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 text-red-500 hover:text-red-600"
        title="Delete Habit"
      >
        <Trash2 size={18} />
      </button>

      <h2 className="text-xl font-semibold text-indigo-600">{habit.title}</h2>
      <p className="text-gray-700 mt-1 mb-3">{habit.description}</p>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-2">
        {habit.tags?.map((tag) => (
          <span key={tag} className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full">
            {tag}
          </span>
        ))}
      </div>

      {/* Streak */}
      <div className="mb-3">
        <span className="text-sm font-medium text-gray-600">Current Streak:</span>{" "}
        <span className="text-sm font-bold text-green-600">{habit.currentStreak || 0} days</span>
      </div>

      {/* Last 7 days completion */}
      <div className="flex gap-1 mb-4">
        {habit.history?.map((h, idx) => (
          <div
            key={idx}
            className={`w-3 h-3 rounded-full ${h.completed ? "bg-green-500" : "bg-gray-300"}`}
          />
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2">
        <button
          onClick={() => window.location.href = `/habit/${habit.id}`}
          className="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
        >
          View
        </button>
        <button
          onClick={async () => {
            try {
              await axiosInstance.post(`/habits/${habit.id}/track`);
              refreshHabits();
            } catch (err) {
              alert(err.response?.data?.message || "Failed to track habit");
            }
          }}
          className="flex-1 bg-green-500 text-white py-2 rounded hover:bg-green-600 transition"
        >
          Track
        </button>
      </div>
    </div>
  );
}
