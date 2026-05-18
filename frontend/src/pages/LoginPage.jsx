import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const CAMPO = "w-full min-h-[48px] px-4 py-3 rounded-xl border-2 border-forest-green/15 bg-silk-cream " +
  "text-sm text-forest-green placeholder-forest-green/35 focus:outline-none focus:border-old-gold transition-colors";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const produtor = await authService.login(form);
      login(produtor);
      navigate("/dashboard");
    } catch {
      setErro("E-mail ou senha incorretos. Verifique e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-silk-cream flex items-start justify-center pt-16 pb-44 md:pb-6">
      <div className="w-full max-w-sm px-4 sm:px-0">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌿</div>
          <h1 className="font-serif text-2xl font-bold text-forest-green">Entrar como Produtor</h1>
          <p className="text-sm text-forest-green/55 mt-1">Acesse seu painel e gerencie seu perfil</p>
        </div>

        {/* Formulário principal */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-forest-green">E-mail</label>
            <input id="email" name="email" type="email" required placeholder="seu@email.com"
              value={form.email} onChange={change} className={CAMPO} />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="senha" className="text-sm font-semibold text-forest-green">Senha</label>
            <input id="senha" name="senha" type="password" required placeholder="Sua senha"
              value={form.senha} onChange={change} className={CAMPO} />
          </div>

          {erro && (
            <p role="alert" className="text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
              {erro}
            </p>
          )}

          <button type="submit" disabled={carregando}
            className="w-full min-h-[52px] bg-forest-green text-silk-cream rounded-xl font-semibold text-base mt-2
              hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-40">
            {carregando ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-center text-sm text-forest-green/55">
            Ainda não tem conta?{" "}
            <Link to="/cadastro" className="text-old-gold font-semibold hover:underline">Cadastre-se</Link>
          </p>
        </form>

        {/* Divisor */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-forest-green/10" />
          <span className="text-xs text-forest-green/35 font-medium">ou</span>
          <div className="flex-1 h-px bg-forest-green/10" />
        </div>

        {/* Acesso do Gestor */}
        <Link
          to="/gestor/login"
          className="flex items-center justify-between w-full bg-white rounded-2xl px-5 py-4 shadow-sm
            border border-forest-green/12 hover:border-forest-green/30 hover:shadow-md
            transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-green/8 flex items-center justify-center shrink-0
              group-hover:bg-forest-green/15 transition-colors">
              <svg className="w-5 h-5 text-forest-green/70" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-forest-green">Área Administrativa</p>
              <p className="text-xs text-forest-green/45">Acesso exclusivo do gestor</p>
            </div>
          </div>
          <svg className="w-4 h-4 text-forest-green/40 group-hover:text-forest-green transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Link>

      </div>
    </div>
  );
}
