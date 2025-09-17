

import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Navbar from "./components/Navbar";
import SalesAdminPage from "./pages/SalesAdminPage";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Breadcrumbs from "./components/Breadcrumbs";

function App() {
  return (
    <BrowserRouter>
      {/* AuthProvider MORA biti unutar Router-a zbog useNavigate */}
      <AuthProvider>
        <Navbar />
        <Breadcrumbs></Breadcrumbs>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage redirectTo="/sale" />} />
          <Route path="/registracija" element={<RegisterPage redirectTo="/sale" />} />

          <Route
            path="/sale"
            element={
              <ProtectedRoute requireAdminOrManager>
                <SalesAdminPage />
              </ProtectedRoute>
            }
          />

          <Route path="/app" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
