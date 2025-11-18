import { useEffect, useState } from "react";
import ChallengeCard from "../components/challenges/ChallengeCard";
import StartChallengeModal from "../components/challenges/StartChallengeModal";
import { useChallenges } from "../hooks/useChallenges"; 

export default function ChallengesPage() {
  const { challenges, loading, fetchChallenges } = useChallenges();
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    fetchChallenges();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Challenges</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {challenges.map((ch) => (
          <ChallengeCard
            key={ch.id}
            challenge={ch}
            onStart={() => setSelected(ch)}
          />
        ))}
      </div>

      {selected && (
        <StartChallengeModal
          challenge={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
