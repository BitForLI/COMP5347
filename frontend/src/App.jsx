import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import TopBar from "./components/TopBar";
import ProtectedRoute from "./components/ProtectedRoute";
import LeftSidebar from "./components/LeftSidebar";
import Home from "./pages/Home";
import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Quiz from "./pages/Quiz";
import Leaderboard from "./pages/Leaderboard";
import Attempts from "./pages/Attempts";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <div className="app">
      <TopBar />
      <div className="layout">
        <ProtectedRoute>
          <LeftSidebar />
        </ProtectedRoute>
        <div className="container">
          <Routes>
            <Route path="/" element={<Navigate to="/homepage" replace />} />
            <Route
              path="/homepage"
              element={
                <ProtectedRoute>
                  <Homepage />
                </ProtectedRoute>
              }
            />
            <Route path="/home" element={<Navigate to="/homepage" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/quiz"
              element={
                <ProtectedRoute>
                  <Quiz />
                </ProtectedRoute>
              }
            />
            <Route
              path="/leaderboard"
              element={
                <ProtectedRoute>
                  <Leaderboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/attempts"
              element={
                <ProtectedRoute>
                  <Attempts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute requireAdmin>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<div className="card">Not found</div>} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

