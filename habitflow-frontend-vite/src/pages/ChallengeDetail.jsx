import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";
import Header from "../components/Header";
import Loader from "../components/Loader";
import dayjs from "dayjs";

export default function ChallengeDetail() {
  const { id } = useParams();

  const [challenge, setChallenge] = useState(null);
  const [userChallenge, setUserChallenge] = useState(null); // started challenge data
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);

  const fetchChallengeDetail = async () => {
    setLoading(true);
    try {
      const { data } = await axiosInstance.get(`/challenges/${id}`);
      setChallenge(data.challenge);

      // ✅ fetch user challenge progress
      const res = await axiosInstance.get(`/challenges/user/all`);
      const found = res.data.userChallenges?.find(
        (uc) => uc.challengeId == id
      );
      setUserChallenge(found || null);

    } catch (err) {
      alert("Failed to load challenge details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChallengeDetail();
  }, [id]);

  // ✅ End challenge logic
  const handleEndChallenge = async () => {
    if (!window.confirm("Are you sure you want to end this challenge?")) return;

    setEnding(true);
    try {
      await axiosInstance.delete(`/challenges/${id}/end`);

      alert("Challenge ended!");
      setUserChallenge(null); // removed from started list
    } catch (err) {
      alert(err.response?.data?.message || "Failed to end challenge");
    } finally {
      setEnding(false);
    }
  };

  if (loading) return <Loader />;
  if (!challenge) return <p className="text-center mt-10">Challenge not found</p>;

  return (
    <div className="bg-gray-100 min-h-screen pb-10">
      <Header />
      <div className="max-w-4xl mx-auto p-6">

        {/* ✅ Challenge Info Card */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <h1 className="text-3xl font-bold text-purple-600 mb-2 flex items-center gap-2">
            {challenge.icon || "🎯"} {challenge.title}
          </h1>

          <p className="text-gray-700 mb-4">{challenge.description}</p>

          <div className="flex items-center gap-4 mb-4">
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              Duration: {challenge.durationDays} days
            </span>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Reward: +{challenge.rewardXP} XP
            </span>
          </div>

          {/* ✅ If challenge is started, show details */}
          {userChallenge ? (
            <div className="bg-indigo-50 p-4 rounded-lg mb-4">
              <p className="text-indigo-700">
                <strong>Started On:</strong> {dayjs(userChallenge.startDate).format("DD MMM YYYY")}
              </p>

              <p className="text-indigo-700">
                <strong>Current Streak:</strong> {userChallenge.currentStreak} days
              </p>

              <p className="text-indigo-700 mb-3">
                <strong>Days Left:</strong>{" "}
                {challenge.durationDays - userChallenge.currentStreak} days
              </p>

              <button
                onClick={handleEndChallenge}
                disabled={ending}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
              >
                {ending ? "Ending..." : "End Challenge"}
              </button>
            </div>
          ) : (
            <p className="text-gray-500 italic">This challenge is not started yet.</p>
          )}
        </div>

        {/* ✅ Milestones */}
        {challenge.milestones?.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold text-gray-700 mb-4">Milestones</h2>

            <div className="flex flex-col gap-3">
              {challenge.milestones.map((m) => (
                <div key={m.id} className="p-3 bg-yellow-50 border rounded-lg">
                  <p className="font-medium text-yellow-700">
                    {m.badgeName}
                  </p>
                  <p className="text-sm text-gray-600">{m.dayCount} days</p>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
