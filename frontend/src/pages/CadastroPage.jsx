import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import CampoFotoUpload from "../components/CampoFotoUpload";
import { CATEGORIAS_PRODUTO } from "../services/produtoService";

const CAMPO = "w-full min-h-[48px] px-4 py-2.5 rounded-xl border-2 border-forest-green/15 bg-silk-cream " +
  "text-sm text-forest-green placeholder-forest-green/35 focus:outline-none focus:border-old-gold transition-colors";

const FORM_VAZIO = {
  nome: "", email: "", senha: "", cpf: "",
  municipio: "", localidade: "", endereco: "",
  anoInicio: "", contato: "", categoriaProd: "",
  fotoUrl: "", fotoProducaoUrl: "",
};

function formatCPF(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
  if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
  return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
}

function formatTelefone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

function Secao({ titulo, children }) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-bold text-forest-green/50 uppercase tracking-widest pt-2 border-t border-forest-green/10">
        {titulo}
      </h3>
      {children}
    </div>
  );
}

function Campo({ label, obrigatorio, children }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-forest-green">
        {label} {obrigatorio && <span className="text-old-gold">*</span>}
      </label>
      {children}
    </div>
  );
}

export default function CadastroPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState(FORM_VAZIO);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  const change = (e) => {
    const { name, value } = e.target;
    if (name === "cpf") {
      setForm((p) => ({ ...p, cpf: formatCPF(value) }));
    } else if (name === "contato") {
      setForm((p) => ({ ...p, contato: formatTelefone(value) }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    try {
      const payload = {
        ...form,
        anoInicio: form.anoInicio ? Number(form.anoInicio) : null,
      };
      const produtor = await authService.cadastrar(payload);
      login(produtor);
      navigate("/dashboard");
    } catch (err) {
      const d = err.response?.data;
      setErro(d?.detail || d?.message || d?.title || "Erro ao cadastrar. Verifique os dados e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="min-h-screen bg-silk-cream pb-44 md:pb-10 flex items-start justify-center pt-8">
      <div className="w-full max-w-2xl px-4 sm:px-0">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🌿</div>
          <h1 className="font-serif text-2xl font-bold text-forest-green">Cadastre-se como Produtor</h1>
          <p className="text-sm text-forest-green/55 mt-1">
            Crie seu perfil público e compartilhe sua história cultural
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow p-6 sm:p-8 flex flex-col gap-6">

          {/* ── Dados de Acesso ── */}
          <Secao titulo="Dados de Acesso">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Nome Completo" obrigatorio>
                <input name="nome" required value={form.nome} onChange={change}
                  placeholder="Seu nome completo" className={CAMPO} />
              </Campo>
              <Campo label="CPF" obrigatorio>
                <input name="cpf" required value={form.cpf} onChange={change}
                  placeholder="000.000.000-00" maxLength={14} inputMode="numeric" className={CAMPO} />
              </Campo>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="E-mail" obrigatorio>
                <input name="email" type="email" required value={form.email} onChange={change}
                  placeholder="seu@email.com" className={CAMPO} />
              </Campo>
              <Campo label="Senha" obrigatorio>
                <input name="senha" type="password" required minLength={6} value={form.senha} onChange={change}
                  placeholder="Mínimo 6 caracteres" className={CAMPO} />
              </Campo>
            </div>
          </Secao>

          {/* ── Localização ── */}
          <Secao titulo="Localização">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Município">
                <input name="municipio" value={form.municipio} onChange={change}
                  placeholder="Nome da sua cidade" className={CAMPO} />
              </Campo>
              <Campo label="Estado / Região">
                <input name="localidade" value={form.localidade} onChange={change}
                  placeholder="Ex.: Minas Gerais" className={CAMPO} />
              </Campo>
            </div>
            <Campo label="Endereço Completo">
              <input name="endereco" value={form.endereco} onChange={change}
                placeholder="Rua, número, bairro, CEP" className={CAMPO} />
            </Campo>
          </Secao>

          {/* ── Perfil Cultural ── */}
          <Secao titulo="Perfil Cultural">
            <Campo label="Categoria Principal" obrigatorio>
              <select
                name="categoriaProd"
                required
                value={form.categoriaProd}
                onChange={change}
                className={CAMPO}
              >
                <option value="" disabled>Selecione sua especialidade...</option>
                {CATEGORIAS_PRODUTO.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.icon} {c.label}
                  </option>
                ))}
              </select>
            </Campo>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Campo label="Ano de Início da Atividade">
                <input name="anoInicio" type="number" min={1900} max={new Date().getFullYear()}
                  value={form.anoInicio} onChange={change}
                  placeholder="Ex.: 1998" inputMode="numeric" className={CAMPO} />
              </Campo>
              <Campo label="WhatsApp / Contato">
                <input
                  name="contato"
                  value={form.contato}
                  onChange={change}
                  placeholder="(00) 00000-0000"
                  maxLength={15}
                  inputMode="tel"
                  className={CAMPO}
                />
              </Campo>
            </div>
          </Secao>

          {/* ── Fotos ── */}
          <Secao titulo="Fotos">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <CampoFotoUpload
                label="Foto de Perfil"
                value={form.fotoUrl}
                onChange={(v) => setForm((p) => ({ ...p, fotoUrl: v }))}
              />
              <CampoFotoUpload
                label="Foto da Produção / Trabalho"
                value={form.fotoProducaoUrl}
                onChange={(v) => setForm((p) => ({ ...p, fotoProducaoUrl: v }))}
              />
            </div>
            <p className="text-xs text-forest-green/40 italic">
              Você pode adicionar ou alterar as fotos a qualquer momento no painel de controle.
            </p>
          </Secao>

          {erro && (
            <p role="alert" className="text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
              {erro}
            </p>
          )}

          <button type="submit" disabled={carregando}
            className="w-full min-h-[56px] bg-forest-green text-silk-cream rounded-xl font-bold text-base mt-2
              hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-40">
            {carregando ? "Cadastrando..." : "Criar meu perfil"}
          </button>

          <p className="text-center text-sm text-forest-green/55">
            Já tem conta?{" "}
            <Link to="/entrar" className="text-old-gold font-semibold hover:underline">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
