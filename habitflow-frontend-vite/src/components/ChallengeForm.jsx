import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function ChallengeForm({ onChallengeAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("");     // ❗ No default
  const [durationDays, setDurationDays] = useState(""); // ❗ No default
  const [rewardXP, setRewardXP] = useState(""); // ❗ No default
  const [loading, setLoading] = useState(false);

  const ICONS = ["🏆", "🔥", "🎯", "💪", "📘", "🚀", "⏳", "🌟", "🏅", "🥇", "🧠", "🥤"];

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) return alert("Title is required");
    if (!durationDays) return alert("Duration is required");
    if (!rewardXP) return alert("Reward XP is required");
    if (!icon.trim()) return alert("Please choose an icon");

    setLoading(true);

    try {
      const { data } = await axiosInstance.post("/challenges", {
        title: title.trim(),
        description: description.trim(),
        icon,
        durationDays: Number(durationDays),
        rewardXP: Number(rewardXP),
        milestones: [], // removed for now
      });

      onChallengeAdded(data);

      // Reset fields
      setTitle("");
      setDescription("");
      setIcon("");
      setDurationDays("");
      setRewardXP("");

    } catch (err) {
      alert(err.response?.data?.message || "Failed to add challenge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition">
      <h2 className="text-2xl font-bold text-purple-600 mb-4">
        Create New Challenge
      </h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">

        {/* Title */}
        <input
          type="text"
          placeholder="Challenge title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-400"
        />

        {/* Description */}
        <textarea
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-3 border rounded-lg focus:ring-2 focus:ring-purple-400"
        />

        {/* ICON PICKER */}
        <div>
          <h4 className="font-medium mb-2">Choose an Icon</h4>

          <div className="grid grid-cols-6 gap-3 mb-3">
            {ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={`text-3xl p-2 rounded-lg border transition 
                  ${icon === ic ? "border-purple-500 bg-purple-100" : "border-gray-300"}
                  hover:bg-purple-50`}
              >
                {ic}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Or enter custom emoji"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            className="p-3 border rounded-lg w-full focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Duration + XP */}
        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Duration (days)"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            className="p-3 border rounded-lg flex-1 focus:ring-2 focus:ring-purple-400"
            min={1}
          />

          <input
            type="number"
            placeholder="Reward XP"
            value={rewardXP}
            onChange={(e) => setRewardXP(e.target.value)}
            className="p-3 border rounded-lg flex-1 focus:ring-2 focus:ring-purple-400"
            min={0}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          {loading ? "Adding..." : "Add Challenge"}
        </button>
      </form>
    </div>
  );
}
