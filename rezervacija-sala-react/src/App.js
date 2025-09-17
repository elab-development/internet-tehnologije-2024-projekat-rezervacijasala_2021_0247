import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import Navbar from "./components/Navbar";
import SalesAdminPage from "./pages/SalesAdminPage";

 

function App() {
  return (
    <BrowserRouter>
     
       <Navbar /> 

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage redirectTo="/app" />} />
        <Route path="/registracija" element={<RegisterPage redirectTo="/app" />} />

        <Route path="/app" element={<LandingPage />} />
        <Route path="/sale" element={<SalesAdminPage />} />
 
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
