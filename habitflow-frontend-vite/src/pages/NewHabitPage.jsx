import HabitForm from "../components/HabitForm";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";

export default function NewHabitPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-3xl mx-auto p-6">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          ← Back
        </button>

        <h1 className="text-3xl font-bold text-indigo-600 mb-6">
          Create New Habit
        </h1>

        <HabitForm
          onHabitAdded={() => {
            navigate("/dashboard");
          }}
        />
      </div>
    </div>
  );
}
