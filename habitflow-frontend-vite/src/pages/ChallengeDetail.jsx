import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Header from "../components/Header";
import Loader from "../components/Loader";
import dayjs from "dayjs";

export default function ChallengeDetail() {
  const { id } = useParams();

  const [challenge, setChallenge] = useState(null);
  const [userChallenge, setUserChallenge] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch challenge + user progress + history
  const fetchData = async () => {
    setLoading(true);

    try {
      const { data } = await axiosInstance.get(`/challenges/${id}`);
      setChallenge(data.challenge);

      const res = await axiosInstance.get(`/challenges/user/all`);
      const uc = res.data.userChallenges?.find(
        (u) => u.challengeId == id
      );

      setUserChallenge(uc || null);

      if (uc) {
        const progressRes = await axiosInstance.get(`/challenges/user-challenge/${uc.id}/history`);
        setHistory(progressRes.data.history || []);
      }

    } catch (err) {
      alert("Failed to load challenge details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // 🟢 Mark today's progress
  const markToday = async () => {
    if (!userChallenge) return;

    setSaving(true);

    try {
      await axiosInstance.post(`/challenges/user-challenge/${userChallenge.id}/complete`);
      await fetchData(); // refresh history & streaks
    } catch (err) {
      alert(err.response?.data?.message || "Failed to mark completion");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;
  if (!challenge) return <p className="text-center mt-10">Challenge not found</p>;

  // Derived values
  const completedDays = userChallenge?.completedDays ?? 0;
  const durationDays = challenge.durationDays ?? 0;
  const daysLeft = Math.max(durationDays - completedDays, 0);

  const today = dayjs().startOf("day");
  const completedToday = history.some((h) =>
    dayjs(h.date).isSame(today, "day") && h.isCompleted
  );

  // Compute longest streak from history
  const computeLongestStreak = () => {
    let longest = 0;
    let current = 0;

    const sorted = [...history].sort((a, b) => new Date(a.date) - new Date(b.date));

    sorted.forEach((h) => {
      if (h.isCompleted) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    });

    return longest;
  };

  const longestStreak = computeLongestStreak();

  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      <Header />
      <div className="max-w-4xl mx-auto p-6">

        {/* Challenge Info */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">
            {challenge.icon || "🎯"} {challenge.title}
          </h1>

          <p className="text-gray-700 mb-4">{challenge.description}</p>

          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Duration: {durationDays} days
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Reward: +{challenge.rewardXP} XP
            </span>
          </div>

          {userChallenge ? (
            <div className="bg-indigo-50 p-4 rounded-lg">
              <p className="text-indigo-700">
                <strong>Started On:</strong>{" "}
                {dayjs(userChallenge.startDate).format("DD MMM YYYY")}
              </p>

              <p className="text-indigo-700">
                <strong>Current Streak:</strong> {completedDays} days
              </p>

              <p className="text-indigo-700">
                <strong>Longest Streak:</strong> {longestStreak} days
              </p>

              <p className="text-indigo-700 mb-3">
                <strong>Days Left:</strong> {daysLeft} days
              </p>

              <button
                onClick={markToday}
                disabled={completedToday || saving}
                className={`px-4 py-2 mt-3 rounded text-white ${
                  completedToday
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600"
                }`}
              >
                {completedToday ? "Done Today" : saving ? "Saving..." : "Mark Today Complete"}
              </button>
            </div>
          ) : (
            <p className="text-gray-500 italic">This challenge is not started yet.</p>
          )}
        </div>

        {/* 7-Day History */}
        {history.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              Last 7 Days
            </h2>

            <div className="grid grid-cols-7 gap-2">
              {history.map((h, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col items-center p-2 rounded ${
                    h.isCompleted
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  <span className="text-sm font-semibold">
                    {dayjs(h.date).format("ddd")}
                  </span>
                  <span className="text-lg font-bold">
                    {h.isCompleted ? "✔" : "✕"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
