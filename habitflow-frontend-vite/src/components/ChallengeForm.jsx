import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function ChallengeForm({ onChallengeAdded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🏆");
  const [durationDays, setDurationDays] = useState(7);
  const [rewardXP, setRewardXP] = useState(0);
  const [milestones, setMilestones] = useState([{ dayCount: "", badgeName: "" }]);
  const [loading, setLoading] = useState(false);

  const handleMilestoneChange = (index, field, value) => {
    const updated = [...milestones];
    updated[index][field] = value;
    setMilestones(updated);
  };

  const addMilestone = () => setMilestones([...milestones, { dayCount: "", badgeName: "" }]);
  const removeMilestone = (index) => setMilestones(milestones.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");

    setLoading(true);
    try {
      const filteredMilestones = milestones.filter(m => m.dayCount && m.badgeName);

      const { data } = await axiosInstance.post("/challenges", {
        title: title.trim(),
        description: description.trim(),
        icon,
        durationDays: Number(durationDays),
        rewardXP: Number(rewardXP),
        milestones: filteredMilestones,
      });

      onChallengeAdded(data);

      setTitle("");
      setDescription("");
      setIcon("🏆");
      setDurationDays(7);
      setRewardXP(0);
      setMilestones([{ dayCount: "", badgeName: "" }]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add challenge");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition transform">
      <h2 className="text-2xl font-bold text-purple-600 mb-4">Create New Challenge</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Challenge title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <input
          type="text"
          placeholder="Icon (emoji)"
          value={icon}
          onChange={(e) => setIcon(e.target.value)}
          className="p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
        />
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Duration (days)"
            value={durationDays}
            onChange={(e) => setDurationDays(e.target.value)}
            className="p-3 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
            min={1}
          />
          <input
            type="number"
            placeholder="Reward XP"
            value={rewardXP}
            onChange={(e) => setRewardXP(e.target.value)}
            className="p-3 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
            min={0}
          />
        </div>

        {/* Milestones */}
        <div>
          <h4 className="font-medium mb-1">Milestones (optional)</h4>
          {milestones.map((m, index) => (
            <div key={index} className="flex gap-2 mb-2 items-center">
              <input
                type="number"
                placeholder="Day Count"
                value={m.dayCount}
                onChange={(e) => handleMilestoneChange(index, "dayCount", e.target.value)}
                className="p-2 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
                min={1}
              />
              <input
                type="text"
                placeholder="Badge Name"
                value={m.badgeName}
                onChange={(e) => handleMilestoneChange(index, "badgeName", e.target.value)}
                className="p-2 border rounded-lg flex-1 focus:outline-none focus:ring-2 focus:ring-purple-400"
              />
              <button
                type="button"
                onClick={() => removeMilestone(index)}
                className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addMilestone}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 mb-3"
          >
            Add Milestone
          </button>
        </div>

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
