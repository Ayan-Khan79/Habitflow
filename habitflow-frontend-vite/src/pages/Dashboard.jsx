import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";
import HabitCard from "../components/HabitCard";
import Loader from "../components/Loader";
import Header from "../components/Header";
import HabitForm from "../components/HabitForm";

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tagFilter, setTagFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 6;

  const fetchHabits = async (tag = "", pageNum = 1) => {
    setLoading(true);
    try {
      const url = `/habits?tag=${tag}&page=${pageNum}&limit=${limit}`;
      const { data } = await axiosInstance.get(url);

      // Backend returns { habits, totalCount }
      setHabits(data.habits || []);
      const total = Number(data.totalCount || 0);
      setTotalPages(Math.ceil(total / limit));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to fetch habits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHabits(tagFilter, page);
  }, [tagFilter, page]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-indigo-600 mb-6">Your Habits</h1>

        {/* Filter */}
        <div className="flex gap-2 mb-6 items-center">
          <input
            type="text"
            placeholder="Filter by tag..."
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setPage(1); // reset to first page on filter change
            }}
            className="flex-1 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
          {tagFilter && (
            <button
              onClick={() => setTagFilter("")}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Habit Form */}
        <div className="mb-8">
          <HabitForm onHabitAdded={() => fetchHabits(tagFilter, page)} />
        </div>

        {/* Habit List */}
        {loading ? (
          <Loader />
        ) : habits.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">No habits found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {habits.map((habit) => (
              <HabitCard
                key={habit.id}
                habit={habit}
                refreshHabits={() => fetchHabits(tagFilter, page)}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300"
            >
              Prev
            </button>
            <span className="font-medium">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
