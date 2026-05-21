import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";

const CAMPO = "w-full min-h-[48px] px-4 py-3 rounded-xl border-2 border-forest-green/15 bg-silk-cream " +
  "text-sm text-forest-green placeholder-forest-green/35 focus:outline-none focus:border-old-gold transition-colors";

export default function RedefinirSenhaPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";

  const [form, setForm] = useState({ novaSenha: "", confirmar: "" });
  const [estado, setEstado] = useState("idle"); // idle | loading | sucesso | erro
  const [mensagem, setMensagem] = useState("");

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.novaSenha.length < 6) {
      setMensagem("A senha deve ter pelo menos 6 caracteres.");
      setEstado("erro");
      return;
    }
    if (form.novaSenha !== form.confirmar) {
      setMensagem("As senhas não coincidem.");
      setEstado("erro");
      return;
    }
    setEstado("loading");
    setMensagem("");
    try {
      const res = await authService.redefinirSenha(token, form.novaSenha);
      setMensagem(res.message || "Senha redefinida com sucesso!");
      setEstado("sucesso");
      setTimeout(() => navigate("/entrar"), 3000);
    } catch (err) {
      const msg = err.response?.data?.message || "Token inválido ou expirado. Solicite um novo link.";
      setMensagem(msg);
      setEstado("erro");
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-silk-cream flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <div className="text-5xl mb-4">🔗</div>
          <h1 className="font-serif text-xl font-bold text-forest-green">Link inválido</h1>
          <p className="text-sm text-forest-green/55 mt-2">
            Este link de recuperação não é válido. Solicite um novo na tela de login.
          </p>
          <Link to="/entrar"
            className="mt-6 inline-block px-6 py-2.5 bg-forest-green text-silk-cream rounded-xl font-semibold text-sm">
            Voltar ao login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-silk-cream flex items-start justify-center pt-16 pb-16 px-4">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🔑</div>
          <h1 className="font-serif text-2xl font-bold text-forest-green">Redefinir Senha</h1>
          <p className="text-sm text-forest-green/55 mt-1">
            Escolha uma nova senha para sua conta.
          </p>
        </div>

        {estado === "sucesso" ? (
          <div className="bg-white rounded-2xl shadow p-8 text-center flex flex-col items-center gap-4">
            <span className="text-5xl">✅</span>
            <p className="font-serif text-lg font-bold text-forest-green">Senha redefinida!</p>
            <p className="text-sm text-forest-green/60">{mensagem}</p>
            <p className="text-xs text-forest-green/40">Redirecionando para o login...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-forest-green">
                Nova Senha <span className="text-old-gold">*</span>
              </label>
              <input
                name="novaSenha" type="password" required minLength={6}
                placeholder="Mínimo 6 caracteres"
                value={form.novaSenha} onChange={change}
                className={CAMPO}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-forest-green">
                Confirmar Nova Senha <span className="text-old-gold">*</span>
              </label>
              <input
                name="confirmar" type="password" required
                placeholder="Repita a nova senha"
                value={form.confirmar} onChange={change}
                className={CAMPO}
              />
            </div>

            {estado === "erro" && (
              <p role="alert" className="text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
                {mensagem}
              </p>
            )}

            <button type="submit" disabled={estado === "loading"}
              className="w-full min-h-[52px] bg-forest-green text-silk-cream rounded-xl font-bold text-base mt-1
                hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-40">
              {estado === "loading" ? "Redefinindo..." : "Salvar Nova Senha"}
            </button>

            <Link to="/entrar"
              className="text-center text-sm text-forest-green/50 hover:text-forest-green transition-colors">
              ← Voltar ao login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
