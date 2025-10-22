import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function HabitForm({ onHabitAdded }) {
  const [title, setTitle] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return alert("Title is required");

    setLoading(true);
    try {
      const tagArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const { data } = await axiosInstance.post("/habits", {
        title: title.trim(),
        frequency,
        tags: tagArray,
      });

      onHabitAdded(data);
      setTitle("");
      setTags("");
      setFrequency("daily");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add habit");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-2 mb-6">
      <input
        type="text"
        placeholder="Habit title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 p-2 border rounded"
      />
      <select
        value={frequency}
        onChange={(e) => setFrequency(e.target.value)}
        className="p-2 border rounded"
      >
        <option value="daily">Daily</option>
        <option value="weekly">Weekly</option>
      </select>
      <input
        type="text"
        placeholder="Tags (comma separated)"
        value={tags}
        onChange={(e) => setTags(e.target.value)}
        className="flex-1 p-2 border rounded"
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
      >
        {loading ? "Adding..." : "Add Habit"}
      </button>
    </form>
  );
}
