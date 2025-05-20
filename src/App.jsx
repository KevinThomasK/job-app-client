import { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import axios from "axios";
import Layout from "./components/Job/Layout";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateJob from "./pages/CreateJob";
import EditJob from "./pages/EditJob"; // Import the new EditJob component
import NotFound from "./pages/NotFound";

// Set axios base URL
axios.defaults.baseURL = "http://localhost:5000/api";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setIsLoading(false);
          return;
        }

        const response = await axios.get("/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUser({
          token,
          user: response.data.user,
        });
      } catch (error) {
        console.error("Error fetching current user:", error);
        localStorage.removeItem("token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();
  }, []);

  const updateUser = (token, userData) => {
    localStorage.setItem("token", token);
    setUser({ token, user: userData });
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl font-semibold">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* Routes with layout (navbar) */}
        <Route element={<Layout user={user} handleLogout={handleLogout} />}>
          <Route path="/" element={<Home user={user} />} />
          <Route
            path="/create-job"
            element={
              user ? (
                <CreateJob user={user} />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
          <Route
            path="/edit-job/:id"
            element={
              user ? <EditJob user={user} /> : <Navigate to="/login" replace />
            }
          />
        </Route>

        {/* Routes without layout */}
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" replace /> : <Login setUser={updateUser} />
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/" replace />
            ) : (
              <Register setUser={updateUser} />
            )
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
