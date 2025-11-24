import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import HabitDetail from "./pages/HabitDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import NewChallengePage from "./pages/NewChallengePage";
import NewHabitPage from "./pages/NewHabitPage";
import ChallengeDetail from "./pages/ChallengeDetail";
import { XpProvider } from "./context/XpContext";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";

export default function App() {
  return (
    <XpProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* View Habit Detail */}
          <Route
            path="/habit/:id"
            element={
              <ProtectedRoute>
                <HabitDetail />
              </ProtectedRoute>
            }
          />

          {/* ✅ Create New Habit */}
          <Route
            path="/new-habit"
            element={
              <ProtectedRoute>
                <NewHabitPage />
              </ProtectedRoute>
            }
          />

          {/* ✅ Create New Challenge */}
          <Route
            path="/new-challenge"
            element={
              <ProtectedRoute>
                <NewChallengePage />
              </ProtectedRoute>
            }
          />
          {/* ✅ View  a Challenge */}
          <Route
            path="/challenges/:id"
            element={
              <ProtectedRoute>
                <ChallengeDetail />
              </ProtectedRoute>
            }
          />

          <Route
            path="/analytics"
            element={<ProtectedRoute><AnalyticsDashboard /></ProtectedRoute>}
          />


          {/* Default redirect */}
          <Route path="*" element={<Login />} />
        </Routes>
      </Router>
    </XpProvider>
  );
}
