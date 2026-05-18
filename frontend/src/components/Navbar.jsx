import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Navbar() {
  const { produtor, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors px-1 py-0.5 ${
      isActive
        ? "text-old-gold border-b-2 border-old-gold"
        : "text-silk-cream hover:text-old-gold"
    }`;

  return (
    <nav className="hidden md:block bg-forest-green shadow-md">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex items-center justify-between py-3">

        {/* Logo */}
        <Link to="/" className="flex items-center shrink-0">
          <img src={logo} alt="Raízes Culturais" className="h-10 w-auto object-contain" />
        </Link>

        {/* Links principais — Assistente IA removido, Vitrine adicionada */}
        <div className="flex gap-6 items-center">
          <NavLink to="/" end className={linkClass}>Início</NavLink>
          <NavLink to="/vitrine" className={linkClass}>Vitrine</NavLink>
          <NavLink to="/produtores" className={linkClass}>Produtores</NavLink>
          <NavLink to="/eventos" className={linkClass}>Eventos</NavLink>
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {produtor ? (
            <>
              <button
                onClick={() => navigate("/dashboard")}
                className="flex items-center gap-2 text-sm font-semibold text-silk-cream hover:text-old-gold transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-old-gold/20 border border-old-gold/50 flex items-center justify-center text-old-gold font-bold text-xs">
                  {produtor.nome.charAt(0).toUpperCase()}
                </div>
                {produtor.nome.split(" ")[0]}
              </button>
              <button
                onClick={() => { logout(); navigate("/"); }}
                className="text-xs px-3 py-1.5 rounded-lg bg-white/10 text-silk-cream/70 hover:bg-red-500/40 hover:text-white transition-colors"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <NavLink to="/entrar" className="text-sm font-semibold text-silk-cream hover:text-old-gold transition-colors">
                Entrar
              </NavLink>
              <NavLink to="/cadastro"
                className="text-sm font-semibold px-4 py-1.5 rounded-xl bg-old-gold text-forest-green hover:bg-old-gold/80 transition-colors">
                Cadastrar
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
