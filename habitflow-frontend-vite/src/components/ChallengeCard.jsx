import React, { useState } from "react";
import axiosInstance from "../api/axiosInstance";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function ChallengeCard({ challenge, refreshChallenges }) {

  const [starting, setStarting] = useState(false);
  const [started, setStarted] = useState(challenge.isStarted || false);

  if (!challenge) return null;

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete "${challenge.title}"?`)) return;

    try {
      await axiosInstance.delete(`/challenges/${challenge.id}`);
      refreshChallenges();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to delete Challenge");
    }
  };

  // ✅ Start challenge logic
  const handleStart = async () => {
    try {
      setStarting(true);

      const res = await axiosInstance.post(`/challenges/${challenge.id}/start`);

      if (res.status === 201) {
        setStarted(true);
        refreshChallenges();
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to start challenge");
    } finally {
      setStarting(false);
    }
  };

  // ✅ End challenge logic (does NOT delete challenge)
  const handleEnd = async () => {
    try {
      const res = await axiosInstance.delete(
        `/challenges/${challenge.id}/end`
      );

      if (res.status === 200) {
        setStarted(false);   // ✅ Mark as not started
        refreshChallenges(); // ✅ Refresh dashboard
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to end challenge");
    }
  };

  return (
    <div className="relative bg-white rounded-xl shadow-md p-5 hover:shadow-xl hover:scale-105 transition transform">

      <div className="text-5xl mb-3 flex justify-center">{challenge.icon || "🎯"}</div>

      <button
        onClick={handleDelete}
        className="absolute top-3 right-3 text-red-500 hover:text-red-600"
        title="Delete Challenge"
      >
        <Trash2 size={18} />
      </button>

      <h2 className="text-xl font-semibold text-purple-600 text-center">{challenge.title}</h2>

      <p className="text-gray-700 mt-2 mb-4 text-center text-sm">{challenge.description}</p>

      <div className="flex justify-between items-center mb-4 px-2">
        <span className="text-sm text-gray-500">{challenge.durationDays} days</span>
        <span className="text-sm font-medium text-green-600">+{challenge.rewardXP} XP</span>
      </div>

      {challenge.milestones?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 justify-center">
          {challenge.milestones.map((m) => (
            <span
              key={m.id}
              className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full"
            >
              {m.badgeName} ({m.dayCount}d)
            </span>
          ))}
        </div>
      )}

      {/* ✅ Start / Started UI */}
      {started ? (
        <div className="w-full">

          <p className="text-green-600 text-center font-medium mb-2">
            ✅ Challenge Started
          </p>

          {/* View Challenge */}
          <Link
            to={`/challenge/${challenge.id}`}
            className="w-full block text-center py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition mb-2"
          >
            View Challenge
          </Link>

          {/* ✅ End Challenge Button */}
          <button
            onClick={handleEnd}
            className="w-full py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition"
          >
            End Challenge
          </button>

        </div>
      ) : (
        <button
          onClick={handleStart}
          disabled={starting}
          className="w-full py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {starting ? "Starting..." : "Start Challenge"}
        </button>
      )}
    </div>
  );
}
