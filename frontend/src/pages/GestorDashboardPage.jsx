import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { participacaoService } from "../services/participacaoService";
import { eventoService } from "../services/eventoService";
import { produtorService } from "../services/produtorService";
import { authService } from "../services/authService";
import { dicaService } from "../services/dicaService";
import { mensagemService } from "../services/mensagemService";
import { useAuth } from "../context/AuthContext";
import { CATEGORIAS_PRODUTO } from "../services/produtoService";
import CampoFotoUpload from "../components/CampoFotoUpload";

// ── Helpers ──────────────────────────────────────────────────────────────────

const CAMPO = "w-full min-h-[40px] px-3 py-2 rounded-xl border-2 border-forest-green/15 bg-silk-cream " +
  "text-sm text-forest-green placeholder-forest-green/35 focus:outline-none focus:border-old-gold transition-colors";

function Toast({ msg, tipo = "ok", onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 3500); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <div className={`fixed top-4 right-4 z-[100] px-4 py-3 rounded-2xl shadow-xl text-sm font-semibold flex items-center gap-2
      ${tipo === "ok" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}>
      {tipo === "ok" ? "✓" : "✕"} {msg}
    </div>
  );
}

function catLabel(value) {
  return CATEGORIAS_PRODUTO.find((c) => c.value === value)?.label || value || "—";
}

function isExpirado(dataFim) {
  if (!dataFim) return false;
  return new Date(dataFim + "T23:59:59") < new Date();
}

// ── Aba: Participações ────────────────────────────────────────────────────────

function AbaParticipacoes({ participacoes, eventos, carregando, navigate }) {
  const [filtroEvento, setFiltroEvento] = useState("todos");
  const [filtroTipo, setFiltroTipo] = useState("todos");

  const filtradas = participacoes.filter((p) => {
    const matchEvento = filtroEvento === "todos" || String(p.eventoId) === filtroEvento;
    const matchTipo = filtroTipo === "todos"
      || (filtroTipo === "EXPOSITOR" && p.tipoParticipacao !== "VISITANTE")
      || (filtroTipo === "VISITANTE" && p.tipoParticipacao === "VISITANTE");
    return matchEvento && matchTipo;
  });

  const chip = (ativo) =>
    `px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
      ativo ? "bg-forest-green text-silk-cream border-forest-green" : "bg-white text-forest-green/60 border-forest-green/20"
    }`;

  return (
    <div className="flex flex-col gap-4">
      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {[["todos","Todos"],["EXPOSITOR","🏺 Expositores"],["VISITANTE","👥 Visitantes"]].map(([v,l]) => (
            <button key={v} className={chip(filtroTipo === v)} onClick={() => setFiltroTipo(v)}>{l}</button>
          ))}
        </div>
        <select value={filtroEvento} onChange={(e) => setFiltroEvento(e.target.value)}
          className="min-h-[36px] px-3 rounded-xl border-2 border-forest-green/15 bg-white text-sm text-forest-green focus:outline-none focus:border-old-gold">
          <option value="todos">Todos os eventos</option>
          {eventos.map((e) => <option key={e.id} value={String(e.id)}>{e.nome}</option>)}
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-forest-green/10 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-forest-green/10">
          <span className="font-serif text-sm font-bold text-forest-green">
            {filtradas.length} registro{filtradas.length !== 1 ? "s" : ""}
          </span>
        </div>
        {carregando ? (
          <div className="p-8 text-center text-forest-green/40 animate-pulse text-sm">Carregando...</div>
        ) : filtradas.length === 0 ? (
          <div className="p-8 text-center text-forest-green/40 italic text-sm">Nenhuma participação encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-forest-green/5 text-forest-green/60 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Participante</th>
                  <th className="text-left px-4 py-3">Tipo</th>
                  <th className="text-left px-4 py-3">Categoria / Contato</th>
                  <th className="text-left px-4 py-3">Evento</th>
                  <th className="text-left px-4 py-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-green/8">
                {filtradas.map((p) => {
                  const isVis = p.tipoParticipacao === "VISITANTE";
                  return (
                    <tr key={p.id} className="hover:bg-silk-cream/40 transition-colors">
                      <td className="px-4 py-3">
                        {!isVis && p.produtorId ? (
                          <button onClick={() => navigate(`/produtores/${p.produtorId}`)}
                            className="font-semibold text-forest-green hover:text-old-gold hover:underline transition-colors text-left">
                            {p.nomeProd || "—"}
                          </button>
                        ) : (
                          <span className="font-semibold text-forest-green">{p.nomeVisitante || p.nomeProd || "—"}</span>
                        )}
                        {!isVis && p.cpf && <p className="font-mono text-xs text-forest-green/40">{p.cpf}</p>}
                        {isVis && p.quantidadePessoas > 1 && <p className="text-xs text-forest-green/40">{p.quantidadePessoas} pessoas</p>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isVis ? "bg-blue-100 text-blue-700" : "bg-old-gold/15 text-old-gold"}`}>
                          {isVis ? "👥 Visitante" : "🏺 Expositor"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-forest-green/70">
                        {isVis ? (
                          <div>
                            <p>{p.emailVisitante || "—"}</p>
                            {p.whatsappVisitante && <p className="text-old-gold">{p.whatsappVisitante}</p>}
                          </div>
                        ) : (
                          <div>
                            <p className="font-semibold" style={{ color: CATEGORIAS_PRODUTO.find(c => c.value === p.categoriaProd)?.cor }}>
                              {catLabel(p.categoriaProd)}
                            </p>
                            {p.contatoProdutor && <p>{p.contatoProdutor}</p>}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-semibold text-forest-green bg-forest-green/10 px-2 py-1 rounded-full">
                          {p.nomeEvento || `Evento #${p.eventoId}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-forest-green/50 text-xs whitespace-nowrap">
                        {new Date(p.dataConfirmacao).toLocaleDateString("pt-BR")}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Aba: Eventos ─────────────────────────────────────────────────────────────

function AbaEventos({ onToast }) {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const FORM_VAZIO = {
    nome: "", tipo: "Feira", horario: "", dataInicio: "", dataFim: "",
    local: "", cidade: "", estado: "", descricao: "",
    vagasExpositor: "", vagasVisitante: "", visitantesEsperados: "",
    entradaGratuita: true, fotoUrl: "",
  };
  const [form, setForm] = useState(FORM_VAZIO);

  const carregar = useCallback(() => {
    setCarregando(true);
    eventoService.listarTodos().then(setEventos).finally(() => setCarregando(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const change = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
  };

  async function handleCriar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await eventoService.criar({
        ...form,
        vagasExpositor: Number(form.vagasExpositor) || 0,
        vagasVisitante: Number(form.vagasVisitante) || 0,
        visitantesEsperados: Number(form.visitantesEsperados) || 0,
      });
      onToast("Evento criado com sucesso!");
      setForm(FORM_VAZIO);
      setShowForm(false);
      carregar();
    } catch {
      onToast("Erro ao criar evento.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletar(id, nome) {
    if (!confirm(`Excluir o evento "${nome}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await eventoService.deletar(id);
      onToast("Evento excluído.");
      carregar();
    } catch {
      onToast("Erro ao excluir evento.", "erro");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-base font-bold text-forest-green">Gestão de Eventos</h3>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 bg-forest-green text-silk-cream rounded-xl text-xs font-semibold hover:bg-old-gold hover:text-forest-green transition-colors">
          {showForm ? "✕ Cancelar" : "+ Novo Evento"}
        </button>
      </div>

      {/* Formulário de criação */}
      {showForm && (
        <form onSubmit={handleCriar} className="bg-white rounded-2xl border border-forest-green/10 shadow-sm p-5 flex flex-col gap-4">
          <h4 className="font-serif text-sm font-bold text-forest-green border-b border-forest-green/10 pb-2">Novo Evento</h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Título <span className="text-old-gold">*</span></label>
              <input name="nome" required value={form.nome} onChange={change} placeholder="Nome do evento" className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Tipo</label>
              <select name="tipo" value={form.tipo} onChange={change} className={CAMPO}>
                {["Feira","Capacitação","Exposição","Evento Cultural"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Horário</label>
              <input name="horario" value={form.horario} onChange={change} placeholder="Ex: 09:00 - 18:00" className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Data de Início <span className="text-old-gold">*</span></label>
              <input name="dataInicio" type="date" required value={form.dataInicio} onChange={change} className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Data de Encerramento <span className="text-old-gold">*</span></label>
              <input name="dataFim" type="date" required value={form.dataFim} onChange={change} className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Município <span className="text-old-gold">*</span></label>
              <input name="cidade" required value={form.cidade} onChange={change} placeholder="Cidade" className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Estado</label>
              <input name="estado" value={form.estado} onChange={change} placeholder="UF" maxLength={2} className={CAMPO} />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Endereço / Local</label>
              <input name="local" value={form.local} onChange={change} placeholder="Ex: Praça Central, s/n" className={CAMPO} />
            </div>
            <div className="sm:col-span-2 flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Descrição</label>
              <textarea name="descricao" rows={3} value={form.descricao} onChange={change}
                placeholder="Descreva o evento..." className={`${CAMPO} resize-none`} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Vagas Expositores</label>
              <input name="vagasExpositor" type="number" min={0} value={form.vagasExpositor} onChange={change} placeholder="0" className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Vagas Visitantes</label>
              <input name="vagasVisitante" type="number" min={0} value={form.vagasVisitante} onChange={change} placeholder="0" className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Visitantes Esperados</label>
              <input name="visitantesEsperados" type="number" min={0} value={form.visitantesEsperados} onChange={change} placeholder="0" className={CAMPO} />
            </div>
            <div className="flex items-center gap-2 pt-5">
              <input id="gratuito" name="entradaGratuita" type="checkbox" checked={form.entradaGratuita} onChange={change}
                className="w-4 h-4 accent-forest-green" />
              <label htmlFor="gratuito" className="text-xs font-semibold text-forest-green">Entrada Gratuita</label>
            </div>
            <div className="sm:col-span-2">
              <CampoFotoUpload label="Foto do Evento" value={form.fotoUrl} onChange={(v) => setForm((p) => ({ ...p, fotoUrl: v }))} />
            </div>
          </div>

          <button type="submit" disabled={salvando}
            className="w-full min-h-[44px] bg-forest-green text-silk-cream rounded-xl font-bold text-sm hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-40">
            {salvando ? "Salvando..." : "Criar Evento"}
          </button>
        </form>
      )}

      {/* Lista de eventos */}
      {carregando ? (
        <p className="text-center text-forest-green/40 animate-pulse text-sm">Carregando eventos...</p>
      ) : eventos.length === 0 ? (
        <p className="text-center text-forest-green/40 italic text-sm py-8">Nenhum evento cadastrado. Crie o primeiro!</p>
      ) : (
        <div className="flex flex-col gap-3">
          {eventos.map((ev) => {
            const expirado = isExpirado(ev.dataFim);
            const restExp = Math.max(0, ev.vagasExpositor - ev.vagasExpositoresUsadas);
            const restVis = Math.max(0, ev.vagasVisitante - ev.vagasVisitantesUsadas);
            return (
              <div key={ev.id} className={`bg-white rounded-2xl border shadow-sm p-4 flex gap-4 items-start ${expirado ? "border-forest-green/10 opacity-70" : "border-forest-green/10"}`}>
                {ev.fotoUrl ? (
                  <img src={ev.fotoUrl} alt={ev.nome} className="w-20 h-16 rounded-xl object-cover shrink-0" />
                ) : (
                  <div className="w-20 h-16 rounded-xl bg-forest-green/10 flex items-center justify-center shrink-0">
                    <span className="text-2xl">📅</span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-serif font-bold text-forest-green text-sm">{ev.nome}</p>
                    {expirado
                      ? <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Encerrado</span>
                      : <span className="text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">Ativo</span>
                    }
                  </div>
                  <p className="text-xs text-forest-green/55">📍 {ev.cidade}, {ev.estado} · 📅 {ev.dataInicio} → {ev.dataFim}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className={`font-semibold ${restExp === 0 ? "text-red-500" : "text-forest-green"}`}>
                      🏺 {restExp}/{ev.vagasExpositor} exp.
                    </span>
                    <span className={`font-semibold ${restVis === 0 ? "text-red-500" : "text-forest-green"}`}>
                      👥 {restVis}/{ev.vagasVisitante} vis.
                    </span>
                  </div>
                </div>
                <button onClick={() => handleDeletar(ev.id, ev.nome)}
                  title="Excluir evento"
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-xl border border-red-200 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Aba: Produtores ───────────────────────────────────────────────────────────

function ModalEnviarMensagemGestor({ produtor, onClose, onToast }) {
  const [conteudo, setConteudo] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleEnviar(e) {
    e.preventDefault();
    setEnviando(true);
    try {
      await mensagemService.enviarPeloGestor(produtor.id, conteudo);
      onToast(`Mensagem enviada para ${produtor.nome.split(" ")[0]}!`);
      onClose();
    } catch {
      onToast("Erro ao enviar mensagem.", "erro");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-base font-bold text-forest-green">
            Mensagem para {produtor.nome.split(" ")[0]}
          </h3>
          <button onClick={onClose} className="text-forest-green/40 hover:text-forest-green text-xl">✕</button>
        </div>
        <form onSubmit={handleEnviar} className="flex flex-col gap-3">
          <textarea
            required rows={5} value={conteudo}
            onChange={(e) => setConteudo(e.target.value)}
            placeholder="Escreva sua mensagem para o produtor..."
            className={`${CAMPO} resize-none`}
          />
          <button type="submit" disabled={enviando || !conteudo.trim()}
            className="w-full min-h-[44px] bg-forest-green text-silk-cream rounded-xl font-bold text-sm hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-40">
            {enviando ? "Enviando..." : "Enviar como Gestor"}
          </button>
        </form>
      </div>
    </div>
  );
}

function AbaProdutores({ onToast, navigate }) {
  const [produtores, setProdutores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [modalMsgProdutor, setModalMsgProdutor] = useState(null);
  const FORM_VAZIO = {
    nome: "", email: "", senha: "raizes2025", cpf: "", municipio: "", localidade: "",
    endereco: "", anoInicio: "", contato: "", categoriaProd: "", fotoUrl: "", fotoProducaoUrl: "",
  };
  const [form, setForm] = useState(FORM_VAZIO);

  const carregar = useCallback(() => {
    setCarregando(true);
    produtorService.listar().then(setProdutores).finally(() => setCarregando(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function handleCadastrar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await authService.cadastrarPeloGestor({
        ...form,
        anoInicio: form.anoInicio ? Number(form.anoInicio) : null,
      });
      onToast("Produtor cadastrado com sucesso!");
      setForm(FORM_VAZIO);
      setShowForm(false);
      carregar();
    } catch (err) {
      onToast(err.response?.data?.message || "Erro ao cadastrar produtor.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletar(id, nome) {
    if (!confirm(`Excluir o produtor "${nome}" e todos os seus produtos? Esta ação não pode ser desfeita.`)) return;
    try {
      await produtorService.deletar(id);
      onToast(`Produtor ${nome} excluído.`);
      carregar();
    } catch {
      onToast("Erro ao excluir produtor.", "erro");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {modalMsgProdutor && (
        <ModalEnviarMensagemGestor
          produtor={modalMsgProdutor}
          onClose={() => setModalMsgProdutor(null)}
          onToast={onToast}
        />
      )}
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-base font-bold text-forest-green">Produtores Cadastrados ({produtores.length})</h3>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 bg-forest-green text-silk-cream rounded-xl text-xs font-semibold hover:bg-old-gold hover:text-forest-green transition-colors">
          {showForm ? "✕ Cancelar" : "+ Novo Produtor"}
        </button>
      </div>

      {/* Formulário de cadastro pelo gestor */}
      {showForm && (
        <form onSubmit={handleCadastrar} className="bg-white rounded-2xl border border-forest-green/10 shadow-sm p-5 flex flex-col gap-4">
          <h4 className="font-serif text-sm font-bold text-forest-green border-b border-forest-green/10 pb-2">Cadastrar Produtor</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Nome <span className="text-old-gold">*</span></label>
              <input name="nome" required value={form.nome} onChange={change} className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">CPF</label>
              <input name="cpf" value={form.cpf} onChange={change} placeholder="000.000.000-00" className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">E-mail <span className="text-old-gold">*</span></label>
              <input name="email" type="email" required value={form.email} onChange={change} className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Senha temporária</label>
              <input name="senha" value={form.senha} onChange={change} className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Categoria Principal</label>
              <select name="categoriaProd" value={form.categoriaProd} onChange={change} className={CAMPO}>
                <option value="">Selecione...</option>
                {CATEGORIAS_PRODUTO.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Município</label>
              <input name="municipio" value={form.municipio} onChange={change} className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Estado</label>
              <input name="localidade" value={form.localidade} onChange={change} placeholder="Ex: Minas Gerais" className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">WhatsApp</label>
              <input name="contato" value={form.contato} onChange={change} placeholder="(00) 00000-0000" className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Ano de Início</label>
              <input name="anoInicio" type="number" min={1900} max={2025} value={form.anoInicio} onChange={change} className={CAMPO} />
            </div>
          </div>
          <button type="submit" disabled={salvando}
            className="w-full min-h-[44px] bg-forest-green text-silk-cream rounded-xl font-bold text-sm hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-40">
            {salvando ? "Cadastrando..." : "Cadastrar Produtor"}
          </button>
        </form>
      )}

      {/* Lista de produtores */}
      {carregando ? (
        <p className="text-center text-forest-green/40 animate-pulse text-sm">Carregando produtores...</p>
      ) : produtores.length === 0 ? (
        <p className="text-center text-forest-green/40 italic text-sm py-8">Nenhum produtor cadastrado.</p>
      ) : (
        <div className="bg-white rounded-2xl border border-forest-green/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-forest-green/5 text-forest-green/60 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left px-4 py-3">Produtor</th>
                  <th className="text-left px-4 py-3">Categoria</th>
                  <th className="text-left px-4 py-3">Município</th>
                  <th className="text-left px-4 py-3">Contato</th>
                  <th className="text-left px-4 py-3">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest-green/8">
                {produtores.map((p) => {
                  const cat = CATEGORIAS_PRODUTO.find((c) => c.value === p.categoriaProd);
                  return (
                    <tr key={p.id} className="hover:bg-silk-cream/40 transition-colors">
                      <td className="px-4 py-3">
                        <button onClick={() => navigate(`/produtores/${p.id}`)}
                          className="font-semibold text-forest-green hover:text-old-gold hover:underline transition-colors text-left">
                          {p.nome}
                        </button>
                        {p.cpf && <p className="font-mono text-xs text-forest-green/40">{p.cpf}</p>}
                      </td>
                      <td className="px-4 py-3">
                        {cat ? (
                          <span className="text-xs font-semibold" style={{ color: cat.cor }}>
                            {cat.icon} {cat.label}
                          </span>
                        ) : <span className="text-xs text-forest-green/40">—</span>}
                      </td>
                      <td className="px-4 py-3 text-xs text-forest-green/70">{p.municipio || p.localidade || "—"}</td>
                      <td className="px-4 py-3 text-xs text-forest-green/70">{p.contato || "—"}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          <button onClick={() => navigate(`/produtores/${p.id}`)} title="Ver perfil"
                            className="w-7 h-7 rounded-lg border border-forest-green/20 text-forest-green/60 hover:bg-forest-green hover:text-silk-cream flex items-center justify-center transition-colors">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                            </svg>
                          </button>
                          <button onClick={() => setModalMsgProdutor(p)} title="Enviar mensagem"
                            className="w-7 h-7 rounded-lg border border-blue-200 text-blue-400 hover:bg-blue-500 hover:text-white flex items-center justify-center transition-colors">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                            </svg>
                          </button>
                          <button onClick={() => handleDeletar(p.id, p.nome)} title="Excluir produtor"
                            className="w-7 h-7 rounded-lg border border-red-200 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Aba: Dicas de Crescimento ─────────────────────────────────────────────────

const CATEGORIAS_DICA = [
  { value: "geral",     label: "Geral",      icon: "💡" },
  { value: "marketing", label: "Marketing",  icon: "📣" },
  { value: "financas",  label: "Finanças",   icon: "💰" },
  { value: "producao",  label: "Produção",   icon: "🌱" },
];

function AbaDicas({ onToast }) {
  const [dicas, setDicas]       = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm]         = useState({ titulo: "", conteudo: "", categoria: "geral" });

  const carregar = useCallback(() => {
    setCarregando(true);
    dicaService.listar().then(setDicas).finally(() => setCarregando(false));
  }, []);

  useEffect(() => { carregar(); }, [carregar]);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function handleCriar(e) {
    e.preventDefault();
    setSalvando(true);
    try {
      await dicaService.criar(form);
      onToast("Dica publicada com sucesso!");
      setForm({ titulo: "", conteudo: "", categoria: "geral" });
      setShowForm(false);
      carregar();
    } catch {
      onToast("Erro ao publicar dica.", "erro");
    } finally {
      setSalvando(false);
    }
  }

  async function handleDeletar(id) {
    if (!confirm("Excluir esta dica?")) return;
    try {
      await dicaService.deletar(id);
      onToast("Dica removida.");
      carregar();
    } catch {
      onToast("Erro ao remover dica.", "erro");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-base font-bold text-forest-green">Dicas de Crescimento ({dicas.length})</h3>
        <button onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 px-4 py-2 bg-forest-green text-silk-cream rounded-xl text-xs font-semibold hover:bg-old-gold hover:text-forest-green transition-colors">
          {showForm ? "✕ Cancelar" : "+ Nova Dica"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCriar} className="bg-white rounded-2xl border border-forest-green/10 shadow-sm p-5 flex flex-col gap-4">
          <h4 className="font-serif text-sm font-bold text-forest-green border-b border-forest-green/10 pb-2">Nova Dica de Crescimento</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Título <span className="text-old-gold">*</span></label>
              <input name="titulo" required value={form.titulo} onChange={change}
                placeholder="Ex: Como fotografar seus produtos" className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-forest-green">Categoria</label>
              <select name="categoria" value={form.categoria} onChange={change} className={CAMPO}>
                {CATEGORIAS_DICA.map((c) => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-forest-green">Conteúdo <span className="text-old-gold">*</span></label>
            <textarea name="conteudo" required rows={4} value={form.conteudo} onChange={change}
              placeholder="Compartilhe conhecimento prático com os produtores..."
              className={`${CAMPO} resize-none`} />
          </div>
          <button type="submit" disabled={salvando}
            className="w-full min-h-[44px] bg-forest-green text-silk-cream rounded-xl font-bold text-sm hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-40">
            {salvando ? "Publicando..." : "Publicar Dica"}
          </button>
        </form>
      )}

      {carregando ? (
        <p className="text-center text-forest-green/40 animate-pulse text-sm">Carregando dicas...</p>
      ) : dicas.length === 0 ? (
        <div className="text-center py-10 bg-old-gold/5 rounded-2xl border-2 border-dashed border-old-gold/20">
          <p className="text-2xl mb-2">💡</p>
          <p className="text-forest-green/40 italic text-sm">Nenhuma dica publicada ainda.</p>
          <p className="text-forest-green/30 text-xs mt-1">Crie dicas de marketing, finanças ou produção para os produtores.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {dicas.map((d) => {
            const cat = CATEGORIAS_DICA.find((c) => c.value === d.categoria) || CATEGORIAS_DICA[0];
            return (
              <div key={d.id} className="bg-white rounded-2xl border border-forest-green/10 shadow-sm p-4 flex gap-4 items-start">
                <span className="text-2xl shrink-0 mt-0.5">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-serif font-bold text-forest-green text-sm">{d.titulo}</p>
                    <span className="text-[10px] font-bold text-old-gold/70 bg-old-gold/10 px-2 py-0.5 rounded-full">{cat.label}</span>
                  </div>
                  <p className="text-xs text-forest-green/65 leading-relaxed">{d.conteudo}</p>
                  <p className="text-xs text-forest-green/35 mt-1.5">
                    {new Date(d.dataCriacao).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <button onClick={() => handleDeletar(d.id)} title="Excluir"
                  className="shrink-0 w-7 h-7 rounded-lg border border-red-200 text-red-400 hover:bg-red-500 hover:text-white flex items-center justify-center transition-colors">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                    <path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/>
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Aba: Configurações ────────────────────────────────────────────────────────

function AbaConfiguracoes({ onToast, onLogout }) {
  const { atualizarCredenciaisGestor } = useAuth();

  const credAtual = (() => {
    try {
      const s = localStorage.getItem("raizes_gestor_creds");
      return s ? JSON.parse(s) : { email: "gestor@raizes.edu.br" };
    } catch { return { email: "gestor@raizes.edu.br" }; }
  })();

  const [form, setForm] = useState({
    novoEmail: credAtual.email,
    senhaAtual: "",
    novaSenha: "",
    confirmarSenha: "",
  });
  const [erro, setErro] = useState(null);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  function handleSalvar(e) {
    e.preventDefault();
    setErro(null);

    const credSalvas = (() => {
      try {
        const s = localStorage.getItem("raizes_gestor_creds");
        return s ? JSON.parse(s) : { email: "gestor@raizes.edu.br", senha: "gestor2025" };
      } catch { return { email: "gestor@raizes.edu.br", senha: "gestor2025" }; }
    })();

    if (form.senhaAtual !== credSalvas.senha) {
      setErro("Senha atual incorreta.");
      return;
    }
    if (!form.novoEmail.includes("@")) {
      setErro("E-mail inválido.");
      return;
    }
    if (form.novaSenha && form.novaSenha.length < 6) {
      setErro("A nova senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (form.novaSenha && form.novaSenha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    const novaSenha = form.novaSenha || credSalvas.senha;
    atualizarCredenciaisGestor(form.novoEmail.trim(), novaSenha);
    onToast("Credenciais atualizadas! Faça login novamente.");
    setTimeout(onLogout, 1800);
  }

  return (
    <div className="max-w-md flex flex-col gap-5">
      <p className="text-sm text-forest-green/60 leading-relaxed">
        Altere o e-mail e a senha de acesso ao painel do gestor. Após salvar, você será
        redirecionado para a tela de login.
      </p>

      <form onSubmit={handleSalvar} className="bg-white rounded-2xl border border-forest-green/10 shadow-sm p-5 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-forest-green">Novo e-mail <span className="text-old-gold">*</span></label>
          <input name="novoEmail" type="email" required value={form.novoEmail} onChange={change} className={CAMPO} />
        </div>

        <div className="border-t border-forest-green/8 pt-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-forest-green">Senha atual <span className="text-old-gold">*</span></label>
            <input name="senhaAtual" type="password" required value={form.senhaAtual} onChange={change}
              placeholder="Confirme sua senha atual" className={CAMPO} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-forest-green">Nova senha <span className="text-forest-green/40 font-normal">(deixe em branco para manter)</span></label>
            <input name="novaSenha" type="password" value={form.novaSenha} onChange={change}
              placeholder="Mínimo 6 caracteres" className={CAMPO} />
          </div>
          {form.novaSenha && (
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-forest-green">Confirmar nova senha</label>
              <input name="confirmarSenha" type="password" value={form.confirmarSenha} onChange={change}
                placeholder="Repita a nova senha" className={CAMPO} />
            </div>
          )}
        </div>

        {erro && (
          <p role="alert" className="text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200">{erro}</p>
        )}

        <button type="submit"
          className="w-full min-h-[44px] bg-forest-green text-silk-cream rounded-xl font-bold text-sm hover:bg-old-gold hover:text-forest-green transition-colors">
          Salvar e Reconectar
        </button>
      </form>
    </div>
  );
}

// ── Dashboard Principal ───────────────────────────────────────────────────────

const ABAS = [
  { id: "participacoes", label: "Participações", icon: "✅" },
  { id: "eventos",       label: "Eventos",       icon: "📅" },
  { id: "produtores",    label: "Produtores",    icon: "🌿" },
  { id: "dicas",         label: "Dicas",         icon: "💡" },
  { id: "configuracoes", label: "Configurações", icon: "⚙️" },
];

export default function GestorDashboardPage() {
  const { logoutGestor, atualizarCredenciaisGestor } = useAuth();
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState("participacoes");
  const [participacoes, setParticipacoes] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [carregandoPart, setCarregandoPart] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    participacaoService.listarTodas().then(setParticipacoes).finally(() => setCarregandoPart(false));
    eventoService.listarTodos().then(setEventos).catch(() => {});
  }, []);

  function showToast(msg, tipo = "ok") {
    setToast({ msg, tipo });
  }

  const totalExp = participacoes.filter((p) => p.tipoParticipacao !== "VISITANTE").length;
  const totalVis = participacoes.filter((p) => p.tipoParticipacao === "VISITANTE").length;
  const eventosAtivos = eventos.filter((e) => !isExpirado(e.dataFim)).length;

  return (
    <div className="min-h-screen bg-silk-cream pb-10">
      {toast && <Toast msg={toast.msg} tipo={toast.tipo} onDismiss={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-forest-green shadow-md">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-silk-cream/50 text-xs uppercase tracking-widest">Painel Administrativo</p>
            <h1 className="font-serif text-2xl text-old-gold font-bold mt-0.5">Dashboard do Gestor</h1>
            <p className="text-silk-cream/60 text-sm mt-1">Gerencie eventos, produtores e participações.</p>
          </div>
          <button onClick={() => { logoutGestor(); navigate("/entrar"); }}
            className="text-xs px-3 py-2 rounded-xl bg-white/15 text-silk-cream hover:bg-red-500/70 transition-colors font-medium">
            Sair
          </button>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total inscrições", value: participacoes.length, icon: "✅" },
            { label: "Eventos ativos",   value: eventosAtivos,        icon: "📅" },
            { label: "Expositores",      value: totalExp,             icon: "🏺" },
            { label: "Visitantes",       value: totalVis,             icon: "👥" },
          ].map((c) => (
            <div key={c.label} className="bg-white rounded-2xl p-4 border border-forest-green/10 shadow-sm">
              <span className="text-2xl">{c.icon}</span>
              <p className="font-bold text-forest-green text-2xl mt-1">{c.value}</p>
              <p className="text-xs text-forest-green/50 mt-0.5">{c.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl border border-forest-green/10 shadow-sm overflow-hidden">
          <div className="flex border-b border-forest-green/10">
            {ABAS.map((aba) => (
              <button key={aba.id} onClick={() => setAbaAtiva(aba.id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-sm font-semibold transition-all border-b-2 ${
                  abaAtiva === aba.id
                    ? "text-forest-green border-old-gold"
                    : "text-forest-green/40 border-transparent hover:text-forest-green/60"
                }`}>
                <span>{aba.icon}</span>
                <span className="hidden sm:inline">{aba.label}</span>
              </button>
            ))}
          </div>

          <div className="p-5">
            {abaAtiva === "participacoes" && (
              <AbaParticipacoes
                participacoes={participacoes}
                eventos={eventos}
                carregando={carregandoPart}
                navigate={navigate}
              />
            )}
            {abaAtiva === "eventos" && (
              <AbaEventos onToast={showToast} />
            )}
            {abaAtiva === "produtores" && (
              <AbaProdutores onToast={showToast} navigate={navigate} />
            )}
            {abaAtiva === "dicas" && (
              <AbaDicas onToast={showToast} />
            )}
            {abaAtiva === "configuracoes" && (
              <AbaConfiguracoes
                onToast={showToast}
                onLogout={() => { logoutGestor(); navigate("/gestor/login"); }}
              />
            )}
          </div>
        </div>

        <p className="text-xs text-forest-green/30 text-center">
          Acesso restrito ao gestor da plataforma · Raízes Culturais
        </p>
      </div>
    </div>
  );
}
