import '@fortawesome/fontawesome-free/css/all.min.css';

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import StudentDashboard from "./components/StudentDashboard";
import PrivateRoute from "./components/PrivateRoute";
import Navbar from "./components/Navbar";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/navbar" element={<Navbar />} />

        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoute
              allowedRoles={["Admin"]}
              element={<AdminDashboard />}
            />
          }
        />

        <Route
          path="/teacher-dashboard"
          element={
            <PrivateRoute
              allowedRoles={["Teacher"]}
              element={<TeacherDashboard />}
            />
          }
        />

        <Route
          path="/student-dashboard"
          element={
            <PrivateRoute
              allowedRoles={["Student"]}
              element={<StudentDashboard />}
            />
          }
        />

        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
