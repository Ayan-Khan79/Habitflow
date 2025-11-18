import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import HabitCard from "../components/HabitCard";
import ChallengeCard from "../components/ChallengeCard";
import Loader from "../components/Loader";
import Header from "../components/Header";

export default function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [loadingHabits, setLoadingHabits] = useState(true);
  const [loadingChallenges, setLoadingChallenges] = useState(true);

  const [tagFilter, setTagFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();
  const limit = 6;

  // ✅ Fetch Challenges
  const fetchChallenges = async () => {
    try {
      const { data } = await axiosInstance.get("/challenges");
      setChallenges(data || []);
    } catch (err) {
      alert("Failed to load challenges");
    } finally {
      setLoadingChallenges(false);
    }
  };

  // ✅ Fetch Habits
  const fetchHabits = async (tag = "", pageNum = 1) => {
    setLoadingHabits(true);
    try {
      const url = `/habits?tag=${tag}&page=${pageNum}&limit=${limit}`;
      const { data } = await axiosInstance.get(url);

      setHabits(data.habits || []);
      setTotalPages(Math.ceil(Number(data.totalCount || 0) / limit));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to load habits");
    } finally {
      setLoadingHabits(false);
    }
  };

  useEffect(() => {
    fetchChallenges();
    fetchHabits(tagFilter, page);
  }, [tagFilter, page]);

  return (
    <div className="bg-gray-50 min-h-screen">
      <Header />

      {/* ✅ Create New Buttons */}
      <div className="max-w-7xl mx-auto p-6 flex justify-end gap-4">
        <button
          onClick={() => navigate("/new-challenge")}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition"
        >
          + New Challenge
        </button>

        <button
          onClick={() => navigate("/new-habit")}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition"
        >
          + New Habit
        </button>
      </div>

      <div className="max-w-7xl mx-auto p-6">

        {/* ✅ Challenges Section */}
        <h1 className="text-3xl font-bold text-purple-600 mb-4">
          Your Challenges
        </h1>

        {loadingChallenges ? (
          <Loader />
        ) : challenges.length === 0 ? (
          <p className="text-gray-500 mb-10">No challenges found.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {challenges.map((c) => (
              <ChallengeCard
                key={c.id}
                challenge={c}
                refreshChallenges={fetchChallenges}
              />
            ))}
          </div>
        )}

        {/* ✅ Habits Section */}
        <h1 className="text-3xl font-bold text-indigo-600 mb-6">
          Your Habits
        </h1>

        {/* Filter Input */}
        <div className="flex gap-2 mb-6 items-center">
          <input
            type="text"
            placeholder="Filter by tag..."
            value={tagFilter}
            onChange={(e) => {
              setTagFilter(e.target.value);
              setPage(1);
            }}
            className="flex-1 p-3 border rounded-lg shadow-sm focus:ring-indigo-400 transition"
          />

          {tagFilter && (
            <button
              onClick={() => setTagFilter("")}
              className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Clear
            </button>
          )}
        </div>

        {loadingHabits ? (
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

        {/* ✅ Pagination */}
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
