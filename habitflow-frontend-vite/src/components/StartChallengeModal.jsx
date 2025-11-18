import { useChallenges } from "../../hooks/useChallenges";

export default function StartChallengeModal({ challenge, onClose }) {
  const { startChallenge, loading } = useChallenges();

  const handleStart = async () => {
    await startChallenge(challenge.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg">
        <h2 className="text-2xl font-bold">Start Challenge</h2>
        <p className="mt-2 text-gray-700 text-sm">{challenge.description}</p>

        <div className="mt-5 flex gap-3 justify-end">
          <button
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            onClick={handleStart}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
          >
            {loading ? "Starting..." : "Start"}
          </button>
        </div>
      </div>
    </div>
  );
}
