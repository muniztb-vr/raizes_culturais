import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { participacaoService } from "../services/participacaoService";

const CAMPO = "w-full min-h-[44px] px-4 py-2.5 rounded-xl border-2 border-forest-green/15 bg-silk-cream " +
  "text-sm text-forest-green placeholder-forest-green/35 focus:outline-none focus:border-old-gold transition-colors";

function VagasBadge({ restantes, esgotado }) {
  if (esgotado) {
    return (
      <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-full border border-red-200">
        Vagas Esgotadas
      </span>
    );
  }
  return (
    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
      restantes <= 10
        ? "text-amber-700 bg-amber-50 border-amber-200"
        : "text-green-700 bg-green-50 border-green-200"
    }`}>
      {restantes} vaga{restantes !== 1 ? "s" : ""} disponíve{restantes !== 1 ? "is" : "l"}
    </span>
  );
}

export default function ParticipacaoModal({ evento, vagas, onClose, onVagaUsada }) {
  const { produtor } = useAuth();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState("expositor");
  const [processando, setProcessando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [erro, setErro] = useState(null);
  const [form, setForm] = useState({ nomeVisitante: "", emailVisitante: "", whatsappVisitante: "", quantidadePessoas: 1 });

  if (!evento) return null;

  const vagasExp = vagas?.expositor ?? evento.vagasExpositor;
  const vagasVis = vagas?.visitante ?? evento.vagasVisitante;
  const semVagasExp = vagasExp <= 0;
  const semVagasVis = vagasVis <= 0;

  const change = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === "quantidadePessoas" ? Math.max(1, Number(value)) : value }));
  };

  async function handleExpositor() {
    if (!produtor) { setErro("login_required"); return; }
    if (semVagasExp) return;
    setProcessando(true);
    setErro(null);
    try {
      await participacaoService.confirmar(produtor.id, evento.id, evento.nome);
      onVagaUsada?.("expositor", 1);
      setEnviado(true);
    } catch (err) {
      const status = err.response?.status;
      setErro(status === 409
        ? "Você já confirmou participação neste evento como expositor."
        : "Erro ao confirmar inscrição. Tente novamente.");
    } finally {
      setProcessando(false);
    }
  }

  async function handleVisitante(e) {
    e.preventDefault();
    if (semVagasVis) return;
    const qtd = Number(form.quantidadePessoas);
    if (qtd > vagasVis) { setErro(`Só restam ${vagasVis} vaga${vagasVis !== 1 ? "s" : ""} para visitantes.`); return; }
    setProcessando(true);
    setErro(null);
    try {
      await participacaoService.confirmarVisitante(evento.id, {
        nomeEvento: evento.nome,
        nomeVisitante: form.nomeVisitante,
        emailVisitante: form.emailVisitante,
        whatsappVisitante: form.whatsappVisitante,
        quantidadePessoas: qtd,
      });
      onVagaUsada?.("visitante", qtd);
      setEnviado(true);
    } catch (err) {
      const status = err.response?.status;
      setErro(status === 409
        ? "Este e-mail já está inscrito neste evento. Use outro e-mail ou entre em contato com o organizador."
        : "Erro ao confirmar inscrição. Tente novamente.");
    } finally {
      setProcessando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full md:max-w-xl bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-forest-green/10 px-5 py-4 flex items-start justify-between rounded-t-3xl z-10">
          <div>
            <h2 className="font-serif text-lg font-bold text-forest-green">Confirmar Participação</h2>
            <p className="text-sm text-forest-green/50">{evento.nome}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-forest-green/40 hover:text-forest-green">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-5">
          {enviado ? (
            <div className="py-10 text-center flex flex-col items-center gap-3">
              <span className="text-5xl">✅</span>
              <p className="font-serif text-xl text-forest-green font-bold">
                {tipo === "expositor" ? "Vaga de expositor reservada!" : "Inscrição confirmada!"}
              </p>
              <p className="text-sm text-forest-green/60 max-w-xs">
                {tipo === "expositor"
                  ? "Seus dados foram enviados ao gestor. Aguarde o contato."
                  : "Esperamos por você! Em breve você receberá mais informações."}
              </p>
              <button onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-forest-green text-silk-cream rounded-xl font-semibold text-sm hover:bg-old-gold hover:text-forest-green transition-colors">
                Fechar
              </button>
            </div>
          ) : (
            <>
              {/* Seletor Expositor / Visitante */}
              <div className="grid grid-cols-2 gap-2 bg-silk-cream p-1.5 rounded-2xl">
                {[
                  { key: "expositor", label: "Como Expositor", icon: "🏺", esgotado: semVagasExp },
                  { key: "visitante", label: "Como Visitante",  icon: "👥", esgotado: semVagasVis },
                ].map(({ key, label, icon, esgotado }) => (
                  <button key={key} onClick={() => { setTipo(key); setErro(null); }}
                    disabled={esgotado}
                    className={`flex flex-col items-center gap-1 py-3 rounded-xl text-sm font-semibold transition-all ${
                      esgotado ? "opacity-40 cursor-not-allowed text-forest-green/40"
                        : tipo === key ? "bg-white text-forest-green shadow"
                        : "text-forest-green/55 hover:bg-white/60"
                    }`}>
                    <span className="text-2xl">{icon}</span>
                    {label}
                    {esgotado && <span className="text-[10px] text-red-500 font-bold">Esgotado</span>}
                  </button>
                ))}
              </div>

              {/* Disponibilidade */}
              <div className="flex items-center justify-between bg-forest-green/5 rounded-xl px-4 py-3">
                <span className="text-xs text-forest-green/60 font-semibold">
                  {tipo === "expositor" ? "Vagas de expositor" : "Vagas para visitantes"}
                </span>
                <VagasBadge
                  restantes={tipo === "expositor" ? vagasExp : vagasVis}
                  esgotado={tipo === "expositor" ? semVagasExp : semVagasVis}
                />
              </div>

              {/* Erro */}
              {erro && erro !== "login_required" && (
                <p role="alert" className="text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200">{erro}</p>
              )}

              {/* ── Fluxo Expositor ── */}
              {tipo === "expositor" && (
                erro === "login_required" ? (
                  <div className="bg-old-gold/10 border border-old-gold/30 rounded-2xl p-5 text-center flex flex-col gap-3">
                    <span className="text-3xl">🔐</span>
                    <p className="font-serif text-base font-bold text-forest-green">É necessário estar logado</p>
                    <p className="text-sm text-forest-green/65">
                      Somente produtores cadastrados podem reservar vagas como expositores.
                    </p>
                    <div className="flex gap-2">
                      <button onClick={() => { onClose(); navigate("/entrar"); }}
                        className="flex-1 min-h-[44px] bg-forest-green text-silk-cream rounded-xl font-semibold text-sm hover:bg-old-gold hover:text-forest-green transition-colors">
                        Entrar
                      </button>
                      <button onClick={() => { onClose(); navigate("/cadastro"); }}
                        className="flex-1 min-h-[44px] border-2 border-forest-green/25 text-forest-green rounded-xl font-semibold text-sm hover:bg-forest-green/10 transition-colors">
                        Cadastrar-se
                      </button>
                    </div>
                  </div>
                ) : produtor ? (
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-3 bg-forest-green/5 rounded-xl px-4 py-3 border border-forest-green/10">
                      <div className="w-10 h-10 rounded-full bg-old-gold/20 flex items-center justify-center shrink-0 overflow-hidden">
                        {produtor.fotoUrl
                          ? <img src={produtor.fotoUrl} className="w-full h-full object-cover" alt="" />
                          : <span className="font-serif font-bold text-forest-green">{produtor.nome.charAt(0)}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-forest-green truncate">{produtor.nome}</p>
                        <p className="text-xs text-forest-green/50">{produtor.municipio || produtor.localidade || "Produtor cadastrado"}</p>
                      </div>
                      <span className="ml-auto shrink-0 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                        ✓ Autenticado
                      </span>
                    </div>
                    <p className="text-sm text-forest-green/65 leading-relaxed">
                      Seus dados serão enviados automaticamente ao gestor do evento.
                    </p>
                    <button onClick={handleExpositor} disabled={processando || semVagasExp}
                      className="w-full min-h-[52px] bg-forest-green text-silk-cream rounded-2xl font-bold text-base
                        hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-40">
                      {processando ? "Confirmando..." : "Reservar Vaga como Expositor"}
                    </button>
                  </div>
                ) : (
                  <button onClick={handleExpositor} disabled={semVagasExp}
                    className="w-full min-h-[52px] bg-forest-green text-silk-cream rounded-2xl font-bold text-base
                      hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-40">
                    Verificar Login e Reservar Vaga
                  </button>
                )
              )}

              {/* ── Fluxo Visitante ── */}
              {tipo === "visitante" && (
                <form onSubmit={handleVisitante} className="flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-forest-green">Nome completo <span className="text-old-gold">*</span></label>
                    <input name="nomeVisitante" required value={form.nomeVisitante} onChange={change}
                      placeholder="Seu nome" className={CAMPO} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-forest-green">E-mail <span className="text-old-gold">*</span></label>
                    <input name="emailVisitante" type="email" required value={form.emailVisitante} onChange={change}
                      placeholder="seu@email.com" className={CAMPO} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-forest-green">WhatsApp</label>
                    <input name="whatsappVisitante" type="tel" value={form.whatsappVisitante} onChange={change}
                      placeholder="(00) 00000-0000" maxLength={15} inputMode="tel" className={CAMPO} />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-forest-green">Quantidade de pessoas</label>
                    <input name="quantidadePessoas" type="number" min={1} max={Math.max(1, vagasVis)}
                      value={form.quantidadePessoas} onChange={change} className={CAMPO} />
                    <p className="text-xs text-forest-green/40">{vagasVis} vagas disponíveis para visitantes</p>
                  </div>
                  <button type="submit" disabled={processando || semVagasVis}
                    className="w-full min-h-[52px] bg-forest-green text-silk-cream rounded-2xl font-bold text-base mt-1
                      hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-40">
                    {processando ? "Confirmando..." : "Confirmar como Visitante"}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
