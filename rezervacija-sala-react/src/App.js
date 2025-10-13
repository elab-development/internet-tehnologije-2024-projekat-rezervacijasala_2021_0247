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
import SaleCatalog from "./pages/SaleCatalog";
import FloorPlan from "./pages/FloorPlan";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AdminReservations from "./pages/AdminReservations";
import AdminPreporuke from "./pages/AdminPreporuke";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <Breadcrumbs />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage redirectTo="/sale" />} />
          <Route path="/registracija" element={<RegisterPage redirectTo="/sale" />} />
          <Route path="/katalog" element={<SaleCatalog />} />
          <Route path="/floor-plan" element={<FloorPlan />} />

          {/* Admin/Manager */}
          <Route
            path="/sale"
            element={
              <ProtectedRoute requireAdminOrManager>
                <SalesAdminPage />
              </ProtectedRoute>
            }
          />

          {/* Admin-only */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin>
                <AdminDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/rezervacije"
            element={
              <ProtectedRoute requireAdmin>
                <AdminReservations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/preporuke"
            element={
              <ProtectedRoute requireAdmin>
                <AdminPreporuke />
              </ProtectedRoute>
            }
          />

          <Route path="/lozinka/posalji" element={<ForgotPasswordPage />} />
          <Route path="/lozinka/reset"  element={<ResetPasswordPage />} />
          {/* Fallback */}
          <Route path="/app" element={<LandingPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
