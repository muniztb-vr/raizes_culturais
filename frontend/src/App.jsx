import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import HomePage from "./pages/HomePage";
import ProdutoresDirectoryPage from "./pages/ProdutoresDirectoryPage";
import ProdutorProfilePage from "./pages/ProdutorProfilePage";
import EventosPage from "./pages/EventosPage";
import AssistentePage from "./pages/AssistentePage";
import CadastroPage from "./pages/CadastroPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import GestorDashboardPage from "./pages/GestorDashboardPage";
import GestorLoginPage from "./pages/GestorLoginPage";
import VitrinePage from "./pages/VitrinePage";
import RedefinirSenhaPage from "./pages/RedefinirSenhaPage";

function RotaProtegida({ children }) {
  const { produtor } = useAuth();
  return produtor ? children : <Navigate to="/entrar" replace />;
}

function RotaProtegidaGestor({ children }) {
  const { gestor } = useAuth();
  return gestor ? children : <Navigate to="/gestor/login" replace />;
}

function AppRoutes() {
  return (
    <div className="min-h-screen flex flex-col bg-silk-cream">
      <Navbar />
      <main className="flex-1">
        <Routes>
          {/* Públicas */}
          <Route path="/" element={<HomePage />} />
          <Route path="/produtores" element={<ProdutoresDirectoryPage />} />
          <Route path="/produtores/:id" element={<ProdutorProfilePage />} />
          <Route path="/vitrine" element={<VitrinePage />} />
          <Route path="/eventos" element={<EventosPage />} />
          <Route path="/assistente" element={<AssistentePage />} />
          <Route path="/cadastro" element={<CadastroPage />} />
          <Route path="/entrar" element={<LoginPage />} />
          <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />

          {/* Produtor autenticado */}
          <Route path="/dashboard" element={
            <RotaProtegida><DashboardPage /></RotaProtegida>
          } />

          {/* Gestor */}
          <Route path="/gestor/login" element={<GestorLoginPage />} />
          <Route path="/gestor" element={
            <RotaProtegidaGestor><GestorDashboardPage /></RotaProtegidaGestor>
          } />
        </Routes>
      </main>
      <BottomNav />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
