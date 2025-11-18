import { useState } from "react";
import api from "../lib/api";

export function useChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchChallenges = async () => {
    setLoading(true);
    try {
      const res = await api.get("/challenges");
      setChallenges(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const startChallenge = async (challengeId) => {
    setLoading(true);
    try {
      await api.post(`/challenges/start/${challengeId}`);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return {
    challenges,
    loading,
    fetchChallenges,
    startChallenge,
  };
}
