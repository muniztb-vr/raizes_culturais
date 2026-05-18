import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { produtoService, CATEGORIAS_PRODUTO, FORM_PRODUTO_VAZIO } from "../services/produtoService";
import { participacaoService } from "../services/participacaoService";
import { authService } from "../services/authService";
import { mensagemService } from "../services/mensagemService";
import { dicaService } from "../services/dicaService";
import { notificacaoService } from "../services/notificacaoService";
import { EVENTOS } from "../data/eventosMock";
import VoiceNarrativaAssistant from "../components/VoiceNarrativaAssistant";
import CampoFotoUpload from "../components/CampoFotoUpload";

const TABS = [
  { id: "narrativa",     label: "Minha História",  icon: "✦" },
  { id: "produtos",      label: "Meus Produtos",   icon: "📦" },
  { id: "eventos",       label: "Eventos",          icon: "📅" },
  { id: "comunicacao",   label: "Comunicação",      icon: "💬" },
  { id: "configuracoes", label: "Configurações",    icon: "⚙️" },
];

const CAMPO = "w-full min-h-[44px] px-4 py-2.5 rounded-xl border-2 border-forest-green/15 bg-silk-cream " +
  "text-sm text-forest-green placeholder-forest-green/35 focus:outline-none focus:border-old-gold transition-colors";

function formatTelefone(v) {
  const d = v.replace(/\D/g, "").slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const DICAS = [
  { icon: "📸", titulo: "Foto de qualidade", texto: "Uma boa foto do seu trabalho aumenta em até 3x o interesse dos visitantes no seu perfil." },
  { icon: "📖", titulo: "Conte sua história", texto: "Produtores que compartilham a tradição familiar recebem mais conexões e pedidos de compra." },
  { icon: "🏷️", titulo: "Precifique bem", texto: "Informe sempre o preço dos produtos. Transparência gera confiança com o comprador." },
  { icon: "📅", titulo: "Participe de eventos", texto: "Feiras culturais são a melhor vitrine para seu trabalho. Confirme presença nos próximos eventos!" },
  { icon: "⭐", titulo: "Incentive avaliações", texto: "Peça aos seus clientes para avaliarem seu perfil. Isso aumenta a credibilidade da sua página." },
];

// ── Aba Produtos ──────────────────────────────────────────────────────────────

function GerenciamentoProdutos({ produtorId }) {
  const [produtos, setProdutos] = useState([]);
  const [form, setForm] = useState(FORM_PRODUTO_VAZIO);
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [erroProduto, setErroProduto] = useState(null);

  useEffect(() => {
    produtoService.listarPorProdutor(produtorId)
      .then(setProdutos).finally(() => setCarregando(false));
  }, [produtorId]);

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function handleSalvar(e) {
    e.preventDefault();
    setSalvando(true);
    setErroProduto(null);
    try {
      const payload = { ...form, quantidade: Number(form.quantidade), produtorId };
      if (editandoId) {
        const atualizado = await produtoService.atualizar(editandoId, payload);
        setProdutos((prev) => prev.map((p) => (p.id === editandoId ? atualizado : p)));
      } else {
        const novo = await produtoService.criar(payload);
        setProdutos((prev) => [...prev, novo]);
      }
      setForm(FORM_PRODUTO_VAZIO);
      setEditandoId(null);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data?.detail || err.message;
      console.error(`[Produto] Erro ${status || "rede"} ao salvar produto:`, msg, err.response?.data);
      setErroProduto(
        status === 404 ? "Produtor não encontrado. Tente fazer login novamente." :
        status === 400 ? `Dados inválidos: ${msg}` :
        `Erro ao salvar produto: ${msg || "verifique a conexão."}`
      );
    } finally {
      setSalvando(false);
    }
  }

  function handleEditar(p) {
    setForm({ nome: p.nome, quantidade: p.quantidade, descricao: p.descricao || "",
      contato: p.contato || "", categoria: p.categoria, preco: p.preco || "", fotoUrl: p.fotoUrl || "" });
    setEditandoId(p.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleDeletar(id) {
    if (!confirm("Remover este produto?")) return;
    await produtoService.deletar(id);
    setProdutos((prev) => prev.filter((p) => p.id !== id));
  }

  const catInfo = (val) => CATEGORIAS_PRODUTO.find((c) => c.value === val) || CATEGORIAS_PRODUTO[0];

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div className="bg-white rounded-2xl shadow p-5 border border-forest-green/10">
        <h3 className="font-serif text-base font-bold text-forest-green mb-4">
          {editandoId ? "✏️ Editar produto" : "➕ Adicionar produto"}
        </h3>
        <form onSubmit={handleSalvar} className="flex flex-col gap-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-forest-green">Nome do produto *</label>
              <input name="nome" required value={form.nome} onChange={change} placeholder="Ex.: Mel de abelha" className={CAMPO} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-forest-green">Quantidade *</label>
              <input name="quantidade" type="number" min={0} required value={form.quantidade} onChange={change} className={CAMPO} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-forest-green">Categoria *</label>
              <select name="categoria" value={form.categoria} onChange={change} className={CAMPO}>
                {CATEGORIAS_PRODUTO.map((c) => (
                  <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-forest-green">Preço</label>
              <input name="preco" value={form.preco} onChange={change} placeholder="Ex.: R$ 25,00 / kg" className={CAMPO} />
            </div>
          </div>
          <CampoFotoUpload
            label="Foto do produto"
            value={form.fotoUrl}
            onChange={(v) => setForm((p) => ({ ...p, fotoUrl: v }))}
            altura="h-28"
          />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-forest-green">Descrição</label>
            <textarea name="descricao" rows={2} value={form.descricao} onChange={change}
              placeholder="Como é feito, ingredientes, características..." className={`${CAMPO} resize-none`} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-forest-green">Contato para pedidos</label>
            <input name="contato" value={form.contato} onChange={change} placeholder="WhatsApp, e-mail..." className={CAMPO} />
          </div>
          {erroProduto && (
            <p role="alert" className="text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
              {erroProduto}
            </p>
          )}
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={salvando}
              className="flex-1 min-h-[44px] bg-forest-green text-silk-cream rounded-xl font-semibold text-sm
                hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-40">
              {salvando ? "Salvando..." : editandoId ? "Salvar alterações" : "Adicionar produto"}
            </button>
            {editandoId && (
              <button type="button" onClick={() => { setForm(FORM_PRODUTO_VAZIO); setEditandoId(null); setErroProduto(null); }}
                className="px-4 min-h-[44px] bg-silk-cream text-forest-green rounded-xl font-semibold text-sm border border-forest-green/20">
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      <div>
        <h3 className="font-serif text-base font-bold text-forest-green mb-3">Seus produtos ({produtos.length})</h3>
        {carregando ? (
          <p className="text-sm text-forest-green/40 animate-pulse">Carregando produtos...</p>
        ) : produtos.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-forest-green/15">
            <p className="text-forest-green/40 text-sm italic">Nenhum produto cadastrado ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {produtos.map((p) => {
              const cat = catInfo(p.categoria);
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-forest-green/10 shadow-sm overflow-hidden flex">
                  {p.fotoUrl ? (
                    <img src={p.fotoUrl} alt={p.nome} className="w-24 h-24 object-cover shrink-0" />
                  ) : (
                    <div className="w-24 h-24 flex items-center justify-center text-3xl shrink-0"
                      style={{ backgroundColor: cat.cor + "18" }}>{cat.icon}</div>
                  )}
                  <div className="flex-1 min-w-0 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-semibold text-forest-green text-sm">{p.nome}</h4>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full mt-0.5"
                          style={{ backgroundColor: cat.cor + "18", color: cat.cor }}>{cat.label}</span>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => handleEditar(p)} className="text-xs px-2 py-1 text-forest-green/60 hover:text-forest-green rounded-lg hover:bg-silk-cream">Editar</button>
                        <button onClick={() => handleDeletar(p.id)} className="text-xs px-2 py-1 text-red-400 hover:text-red-600 rounded-lg hover:bg-red-50">Remover</button>
                      </div>
                    </div>
                    <p className="text-xs text-forest-green/55 mt-1">
                      Qtd: <strong>{p.quantidade}</strong>
                      {p.preco && <> · <strong>{p.preco}</strong></>}
                    </p>
                    {p.descricao && <p className="text-xs text-forest-green/60 mt-1 line-clamp-1">{p.descricao}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Aba Eventos ───────────────────────────────────────────────────────────────

function AbaEventos({ produtor }) {
  const [participacoes, setParticipacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [confirmando, setConfirmando] = useState(null);

  useEffect(() => {
    participacaoService.listarPorProdutor(produtor.id)
      .then(setParticipacoes).finally(() => setCarregando(false));
  }, [produtor.id]);

  const estaConfirmado = (eventoId) => participacoes.some((p) => p.eventoId === eventoId);

  async function handleConfirmar(evento) {
    setConfirmando(evento.id);
    try {
      const nova = await participacaoService.confirmar(produtor.id, evento.id, evento.nome);
      setParticipacoes((prev) => [...prev, nova]);
    } catch (e) {
      if (e.response?.status !== 409) alert("Erro ao confirmar. Tente novamente.");
    } finally {
      setConfirmando(null);
    }
  }

  async function handleCancelar(eventoId) {
    if (!confirm("Cancelar sua participação neste evento?")) return;
    await participacaoService.cancelar(produtor.id, eventoId);
    setParticipacoes((prev) => prev.filter((p) => p.eventoId !== eventoId));
  }

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div className="bg-old-gold/10 border border-old-gold/25 rounded-xl px-4 py-3">
        <p className="text-xs text-forest-green/70 leading-relaxed">
          Confirme sua participação nos eventos. Seu CPF (<strong>{produtor.cpf || "não cadastrado"}</strong>),
          município e produtos serão enviados ao gestor do evento.
        </p>
      </div>
      {carregando ? (
        <p className="text-sm text-forest-green/40 animate-pulse">Carregando eventos...</p>
      ) : (
        EVENTOS.map((evento) => {
          const confirmado = estaConfirmado(evento.id);
          return (
            <div key={evento.id} className="bg-white rounded-2xl border border-forest-green/10 shadow-sm overflow-hidden">
              <div className="flex gap-4 p-4">
                <img src={evento.imagem} alt={evento.nome} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold text-old-gold uppercase tracking-widest">{evento.tipo}</span>
                      <h4 className="font-serif font-bold text-forest-green text-sm mt-0.5 leading-tight">{evento.nome}</h4>
                      <p className="text-xs text-forest-green/55 mt-0.5">📍 {evento.cidade}, {evento.estado}</p>
                      <p className="text-xs text-forest-green/55">
                        {new Date(evento.dataInicio + "T12:00:00").toLocaleDateString("pt-BR")} —{" "}
                        {new Date(evento.dataFim + "T12:00:00").toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    {confirmado && (
                      <span className="shrink-0 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-1 rounded-full">
                        ✓ Confirmado
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    {confirmado ? (
                      <button onClick={() => handleCancelar(evento.id)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-red-300 text-red-500 hover:bg-red-50 transition-colors">
                        Cancelar participação
                      </button>
                    ) : (
                      <button onClick={() => handleConfirmar(evento)} disabled={confirmando === evento.id}
                        className="text-xs px-4 py-1.5 rounded-lg bg-forest-green text-silk-cream font-semibold
                          hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-50">
                        {confirmando === evento.id ? "Confirmando..." : "✓ Confirmar Participação"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// ── Aba Comunicação ───────────────────────────────────────────────────────────

const TIPO_NOT_ICON = { mensagem: "✉️", evento: "📅", avaliacao: "⭐", info: "👁️" };
const CAT_DICA_ICON = { marketing: "📣", financas: "💰", producao: "🌱", geral: "💡" };

function AbaComunicacao({ produtor }) {
  const [mensagens, setMensagens]       = useState([]);
  const [dicas, setDicas]               = useState([]);
  const [notificacoes, setNotificacoes] = useState([]);
  const [carregando, setCarregando]     = useState(true);

  useEffect(() => {
    if (!produtor?.id) return;
    Promise.all([
      mensagemService.listar(produtor.id),
      dicaService.listar(),
      notificacaoService.listar(produtor.id),
    ]).then(([msgs, dcs, nots]) => {
      setMensagens(msgs);
      setDicas(dcs);
      setNotificacoes(nots);
    }).catch(() => {}).finally(() => setCarregando(false));
  }, [produtor?.id]);

  async function marcarMensagemLida(id) {
    await mensagemService.marcarLida(id);
    setMensagens((prev) => prev.map((m) => m.id === id ? { ...m, lida: true } : m));
  }

  async function marcarNotLida(id) {
    await notificacaoService.marcarLida(id);
    setNotificacoes((prev) => prev.map((n) => n.id === id ? { ...n, lida: true } : n));
  }

  async function marcarTodasNotLidas() {
    await notificacaoService.marcarTodasLidas(produtor.id);
    setNotificacoes((prev) => prev.map((n) => ({ ...n, lida: true })));
  }

  const naoLidasMsg = mensagens.filter((m) => !m.lida).length;
  const naoLidasNot = notificacoes.filter((n) => !n.lida).length;

  function tempoRelativo(dataStr) {
    const diff = Date.now() - new Date(dataStr).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 60) return `${min}min atrás`;
    const h = Math.floor(min / 60);
    if (h < 24) return `${h}h atrás`;
    return `${Math.floor(h / 24)}d atrás`;
  }

  if (carregando) return <p className="text-center text-forest-green/40 animate-pulse py-10 text-sm">Carregando comunicação...</p>;

  return (
    <div className="flex flex-col gap-8 max-w-2xl">

      {/* ── Dicas de Crescimento ── */}
      <section>
        <h3 className="font-serif text-base font-bold text-forest-green mb-3">💡 Dicas de Crescimento</h3>
        {dicas.length === 0 ? (
          <div className="text-center py-8 bg-old-gold/5 rounded-2xl border border-old-gold/15">
            <p className="text-forest-green/40 text-sm italic">O gestor ainda não publicou dicas. Em breve!</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {dicas.map((d) => (
              <div key={d.id} className="bg-old-gold/8 border border-old-gold/20 rounded-2xl p-4 flex gap-3">
                <span className="text-2xl shrink-0 mt-0.5">{CAT_DICA_ICON[d.categoria] || "💡"}</span>
                <div>
                  <p className="font-semibold text-forest-green text-sm leading-tight">{d.titulo}</p>
                  <p className="text-xs text-forest-green/65 mt-1 leading-relaxed">{d.conteudo}</p>
                  <span className="inline-block mt-2 text-[10px] font-bold text-old-gold/70 uppercase tracking-wider">
                    {d.categoria}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Notificações ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-base font-bold text-forest-green flex items-center gap-2">
            🔔 Notificações
            {naoLidasNot > 0 && (
              <span className="text-[11px] font-bold bg-forest-green text-silk-cream px-2 py-0.5 rounded-full">
                {naoLidasNot}
              </span>
            )}
          </h3>
          {naoLidasNot > 0 && (
            <button onClick={marcarTodasNotLidas}
              className="text-xs text-forest-green/50 hover:text-forest-green transition-colors">
              Marcar todas como lidas
            </button>
          )}
        </div>

        {notificacoes.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-2xl border-2 border-dashed border-forest-green/12">
            <p className="text-forest-green/40 text-sm italic">Nenhuma notificação ainda.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notificacoes.map((n) => (
              <div key={n.id} onClick={() => !n.lida && marcarNotLida(n.id)}
                className={`flex gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  n.lida
                    ? "bg-white border-forest-green/8 opacity-70"
                    : "bg-white border-forest-green/20 shadow-sm hover:border-old-gold/40"
                }`}>
                <span className="text-lg shrink-0">{TIPO_NOT_ICON[n.tipo] || "🔔"}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-forest-green leading-snug">{n.texto}</p>
                  <p className="text-xs text-forest-green/35 mt-0.5">{tempoRelativo(n.data)}</p>
                </div>
                {!n.lida && <div className="w-2 h-2 rounded-full bg-old-gold shrink-0 mt-1.5" />}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Mensagens ── */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-base font-bold text-forest-green flex items-center gap-2">
            ✉️ Mensagens
            {naoLidasMsg > 0 && (
              <span className="text-[11px] font-bold bg-old-gold text-forest-green px-2 py-0.5 rounded-full">
                {naoLidasMsg} nova{naoLidasMsg !== 1 ? "s" : ""}
              </span>
            )}
          </h3>
        </div>

        {mensagens.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-2xl border-2 border-dashed border-forest-green/12">
            <p className="text-3xl mb-2">📭</p>
            <p className="text-forest-green/40 text-sm italic">Nenhuma mensagem recebida ainda.</p>
            <p className="text-forest-green/30 text-xs mt-1">Quando visitantes enviarem mensagens pelo seu perfil, elas aparecerão aqui.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {mensagens.map((m) => (
              <div key={m.id} className={`bg-white rounded-2xl border p-4 flex flex-col gap-2 transition-all ${
                m.lida ? "border-forest-green/8 opacity-80" : "border-old-gold/40 shadow-sm"
              }`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-forest-green/10 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-forest-green">
                        {m.remetente.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-forest-green leading-tight">{m.remetente}</p>
                      {m.emailRemetente && <p className="text-xs text-forest-green/45">{m.emailRemetente}</p>}
                      {m.whatsappRemetente && <p className="text-xs text-old-gold">{m.whatsappRemetente}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs text-forest-green/35">{tempoRelativo(m.dataEnvio)}</span>
                    {!m.lida && (
                      <button onClick={() => marcarMensagemLida(m.id)}
                        className="text-[11px] px-2 py-0.5 rounded-full border border-forest-green/20 text-forest-green/50 hover:bg-forest-green hover:text-silk-cream transition-colors">
                        Marcar como lida
                      </button>
                    )}
                  </div>
                </div>
                <p className="text-sm text-forest-green/75 leading-relaxed bg-forest-green/5 rounded-xl px-3 py-2">
                  {m.conteudo}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

// ── Aba Configurações ─────────────────────────────────────────────────────────

function AbaConfiguracoes({ produtor, atualizarProdutor }) {
  const [form, setForm] = useState({
    nome: produtor.nome || "", bio: produtor.bio || "",
    municipio: produtor.municipio || "", localidade: produtor.localidade || "",
    endereco: produtor.endereco || "", anoInicio: produtor.anoInicio || "",
    contato: produtor.contato || "", fotoUrl: produtor.fotoUrl || "",
    fotoProducaoUrl: produtor.fotoProducaoUrl || "",
    categoriaProd: produtor.categoriaProd || "",
  });
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [erro, setErro] = useState(null);

  const change = (e) => {
    const { name, value } = e.target;
    if (name === "contato") {
      setForm((p) => ({ ...p, contato: formatTelefone(value) }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  async function handleSalvar(e) {
    e.preventDefault();
    setSalvando(true);
    setErro(null);
    try {
      const payload = { ...form, anoInicio: form.anoInicio ? Number(form.anoInicio) : null, email: produtor.email, cpf: produtor.cpf };
      const atualizado = await authService.atualizarConfiguracoes(produtor.id, payload);
      atualizarProdutor(atualizado);
      setSalvo(true);
      setTimeout(() => setSalvo(false), 3000);
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={handleSalvar} className="flex flex-col gap-5 max-w-2xl">
      {salvo && <div role="alert" className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-xl text-sm font-semibold">✓ Dados atualizados com sucesso!</div>}
      {erro && <p role="alert" className="text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200">{erro}</p>}

      {[
        { titulo: "Dados Pessoais", campos: [
          { label: "Nome completo", name: "nome", required: true },
          { label: "WhatsApp / Contato", name: "contato", placeholder: "(00) 00000-0000", maxLength: 15, inputMode: "tel" },
        ]},
        { titulo: "Localização", campos: [
          { label: "Município", name: "municipio" },
          { label: "Estado / Região", name: "localidade" },
          { label: "Endereço completo", name: "endereco", full: true },
        ]},
      ].map((secao) => (
        <div key={secao.titulo} className="bg-white rounded-2xl p-5 border border-forest-green/10 shadow-sm flex flex-col gap-4">
          <h3 className="font-serif text-base font-bold text-forest-green">{secao.titulo}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {secao.campos.filter(c => !c.full).map((c) => (
              <div key={c.name} className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-forest-green">{c.label}</label>
                <input name={c.name} required={c.required} value={form[c.name]} onChange={change}
                  placeholder={c.placeholder || ""} maxLength={c.maxLength} inputMode={c.inputMode}
                  className={CAMPO} />
              </div>
            ))}
          </div>
          {secao.campos.filter(c => c.full).map((c) => (
            <div key={c.name} className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-forest-green">{c.label}</label>
              <input name={c.name} value={form[c.name]} onChange={change} className={CAMPO} />
            </div>
          ))}
        </div>
      ))}

      <div className="bg-white rounded-2xl p-5 border border-forest-green/10 shadow-sm flex flex-col gap-4">
        <h3 className="font-serif text-base font-bold text-forest-green">Perfil Cultural</h3>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-forest-green">Categoria Principal <span className="text-old-gold">*</span></label>
          <select
            name="categoriaProd"
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
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-forest-green">Ano de início da atividade</label>
          <input name="anoInicio" type="number" min={1900} max={new Date().getFullYear()} value={form.anoInicio} onChange={change} className={CAMPO} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-forest-green">Sobre você / Sua tradição</label>
          <textarea name="bio" rows={4} value={form.bio} onChange={change} className={`${CAMPO} resize-none`} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-forest-green">CPF (não editável)</label>
          <input value={produtor.cpf || "Não cadastrado"} disabled className={`${CAMPO} opacity-50 cursor-not-allowed`} />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 border border-forest-green/10 shadow-sm flex flex-col gap-4">
        <h3 className="font-serif text-base font-bold text-forest-green">Fotos</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <CampoFotoUpload
            label="Foto de perfil"
            value={form.fotoUrl}
            onChange={(v) => setForm((p) => ({ ...p, fotoUrl: v }))}
          />
          <CampoFotoUpload
            label="Foto da produção / trabalho"
            value={form.fotoProducaoUrl}
            onChange={(v) => setForm((p) => ({ ...p, fotoProducaoUrl: v }))}
          />
        </div>
      </div>

      <button type="submit" disabled={salvando}
        className="w-full min-h-[52px] bg-forest-green text-silk-cream rounded-xl font-bold text-base
          hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-40">
        {salvando ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}

// ── Dashboard principal ───────────────────────────────────────────────────────

export default function DashboardPage() {
  const { produtor, logout, atualizarProdutor } = useAuth();
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState("narrativa");

  if (!produtor) { navigate("/entrar"); return null; }

  return (
    <div className="min-h-screen bg-silk-cream pb-44 md:pb-6">
      <div className="bg-forest-green">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-5 flex items-center justify-between">
          <div>
            <p className="text-silk-cream/50 text-xs uppercase tracking-widest">Painel do Produtor</p>
            <h1 className="font-serif text-xl text-silk-cream font-bold leading-tight mt-0.5">
              Olá, {produtor.nome.split(" ")[0]}! 👋
            </h1>
            {(produtor.municipio || produtor.localidade) && (
              <p className="text-silk-cream/50 text-xs mt-0.5">📍 {produtor.municipio || produtor.localidade}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate(`/produtores/${produtor.id}`)}
              className="text-xs px-3 py-2 rounded-xl bg-white/15 text-silk-cream hover:bg-white/25 transition-colors font-medium">
              Ver perfil público
            </button>
            <button onClick={() => { logout(); navigate("/"); }}
              className="text-xs px-3 py-2 rounded-xl bg-white/15 text-silk-cream hover:bg-red-500/70 transition-colors font-medium">
              Sair
            </button>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl overflow-x-auto">
          <div className="flex border-b border-white/10 min-w-max">
            {TABS.map((tab) => (
              <button key={tab.id} onClick={() => setAbaAtiva(tab.id)}
                className={`flex items-center gap-1.5 px-4 sm:px-5 py-3 text-sm font-semibold transition-all border-b-2 whitespace-nowrap ${
                  abaAtiva === tab.id
                    ? "text-old-gold border-old-gold"
                    : "text-silk-cream/50 border-transparent hover:text-silk-cream/80"
                }`}>
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {abaAtiva === "narrativa" && (
          <div className="flex flex-col items-center text-center">
            <h2 className="font-serif text-xl font-bold text-forest-green mb-2">
              Assistente de Narrativa Cultural
            </h2>
            <p className="text-sm text-forest-green/55 mb-8 max-w-2xl mx-auto">
              Digite ou fale sobre sua tradição, família e ofício.
              A IA vai transformar seu relato em uma narrativa cultural profissional para o seu perfil público.
            </p>
            <div className="w-full max-w-2xl">
              <VoiceNarrativaAssistant />
            </div>
          </div>
        )}
        {abaAtiva === "produtos" && (
          <div>
            <h2 className="font-serif text-xl font-bold text-forest-green mb-2">Meus Produtos</h2>
            <p className="text-sm text-forest-green/55 mb-6 max-w-lg">Gerencie os produtos que você produz. Eles ficam visíveis no seu perfil público.</p>
            <GerenciamentoProdutos produtorId={produtor.id} />
          </div>
        )}
        {abaAtiva === "eventos" && (
          <div>
            <h2 className="font-serif text-xl font-bold text-forest-green mb-2">Eventos Disponíveis</h2>
            <p className="text-sm text-forest-green/55 mb-6 max-w-lg">Confirme sua participação nos eventos culturais.</p>
            <AbaEventos produtor={produtor} />
          </div>
        )}
        {abaAtiva === "comunicacao" && (
          <div>
            <h2 className="font-serif text-xl font-bold text-forest-green mb-2">Central de Comunicação</h2>
            <p className="text-sm text-forest-green/55 mb-6 max-w-lg">Notificações, mensagens e dicas para crescer sua presença digital.</p>
            <AbaComunicacao produtor={produtor} />
          </div>
        )}
        {abaAtiva === "configuracoes" && (
          <div>
            <h2 className="font-serif text-xl font-bold text-forest-green mb-2">Configurações do Perfil</h2>
            <p className="text-sm text-forest-green/55 mb-6 max-w-lg">Atualize seus dados cadastrais, fotos e informações de contato.</p>
            <AbaConfiguracoes produtor={produtor} atualizarProdutor={atualizarProdutor} />
          </div>
        )}
      </div>
    </div>
  );
}
