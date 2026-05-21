import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const CAMPO = "w-full min-h-[48px] px-4 py-3 rounded-xl border-2 border-forest-green/15 bg-silk-cream " +
  "text-sm text-forest-green placeholder-forest-green/35 focus:outline-none focus:border-old-gold transition-colors";

export default function GestorLoginPage() {
  const navigate = useNavigate();
  const { loginGestor, gestor } = useAuth();
  const [form, setForm] = useState({ email: "", senha: "" });
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [mostrarDica, setMostrarDica] = useState(false);

  if (gestor) {
    return <Navigate to="/gestor" replace />;
  }

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    // Simula delay de autenticação
    await new Promise((r) => setTimeout(r, 600));
    const ok = loginGestor(form.email, form.senha);
    if (ok) {
      navigate("/gestor", { replace: true });
    } else {
      setErro("Credenciais inválidas. Verifique e-mail e senha do gestor.");
    }
    setCarregando(false);
  }

  return (
    <div className="min-h-screen bg-silk-cream flex items-start justify-center pt-16 pb-44 md:pb-6">
      <div className="w-full max-w-sm px-4 sm:px-0">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-forest-green flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg className="w-8 h-8 text-old-gold" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="font-serif text-2xl font-bold text-forest-green">Área Administrativa</h1>
          <p className="text-sm text-forest-green/55 mt-1">Acesso restrito ao gestor da plataforma</p>
        </div>

        {/* Aviso */}
        <div className="bg-old-gold/10 border border-old-gold/25 rounded-xl px-4 py-3 mb-6 flex gap-3">
          <span className="text-lg shrink-0">🔐</span>
          <p className="text-xs text-forest-green/70 leading-relaxed">
            Esta área é exclusiva para o <strong>gestor da plataforma</strong>.
            Se você é produtor,{" "}
            <Link to="/entrar" className="text-old-gold font-semibold hover:underline">
              entre aqui
            </Link>.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="text-sm font-semibold text-forest-green">
              E-mail do Gestor
            </label>
            <input
              id="email" name="email" type="email" required
              placeholder="gestor@raizes.edu.br"
              value={form.email} onChange={change}
              className={CAMPO}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label htmlFor="senha" className="text-sm font-semibold text-forest-green">
                Senha
              </label>
              <button
                type="button"
                onClick={() => setMostrarDica((v) => !v)}
                className="text-xs text-old-gold hover:underline font-medium"
              >
                Esqueci minha senha
              </button>
            </div>
            <input
              id="senha" name="senha" type="password" required
              placeholder="Senha do gestor"
              value={form.senha} onChange={change}
              className={CAMPO}
            />
            {mostrarDica && (
              <div className="bg-old-gold/10 border border-old-gold/25 rounded-xl px-4 py-3 flex flex-col gap-1">
                <p className="text-xs font-semibold text-forest-green">Credenciais padrão do sistema:</p>
                <p className="text-xs text-forest-green/70">E-mail: <span className="font-mono font-bold">gestor@raizes.edu.br</span></p>
                <p className="text-xs text-forest-green/70">Senha: <span className="font-mono font-bold">gestor2025</span></p>
                <p className="text-xs text-forest-green/50 mt-1">
                  Se já alterou as credenciais, acesse o painel → Configurações para redefinir.
                </p>
              </div>
            )}
          </div>

          {erro && (
            <p role="alert" className="text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
              {erro}
            </p>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full min-h-[52px] bg-forest-green text-silk-cream rounded-xl font-semibold text-base mt-2
              hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-40
              flex items-center justify-center gap-2"
          >
            {carregando ? (
              <><span className="animate-spin">◌</span> Verificando...</>
            ) : (
              <><svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg> Acessar Painel do Gestor</>
            )}
          </button>

          <Link
            to="/entrar"
            className="text-center text-sm text-forest-green/50 hover:text-forest-green transition-colors"
          >
            ← Voltar ao login de produtores
          </Link>
        </form>
      </div>
    </div>
  );
}
