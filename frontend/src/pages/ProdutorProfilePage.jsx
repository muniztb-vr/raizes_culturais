import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { produtorService } from "../services/produtorService";
import { produtoService, CATEGORIAS_PRODUTO } from "../services/produtoService";
import { avaliacaoService } from "../services/avaliacaoService";
import { mensagemService } from "../services/mensagemService";
import { enrichProdutor, formatNumber } from "../utils/produtorUtils";

const TABS = ["Nossa História", "Produtos", "Avaliações", "Ações"];

// ── Componentes auxiliares ────────────────────────────────────────────────────

function Estrelas({ nota, tamanho = "sm" }) {
  const sz = tamanho === "lg" ? "w-5 h-5" : "w-3.5 h-3.5";
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={sz} viewBox="0 0 24 24"
          fill={i <= Math.round(nota) ? "#D4AF37" : "none"}
          stroke="#D4AF37" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ))}
    </div>
  );
}

// Ghost button — borda fina, preenchimento só no hover
const GhostBtn = ({ onClick, icon, label, className = "" }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border
      border-forest-green/30 text-forest-green/80 text-xs font-semibold
      hover:border-forest-green hover:bg-forest-green hover:text-silk-cream
      active:scale-95 transition-all duration-150 ${className}`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

function BarraEstrelas({ n, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-forest-green/55 w-3 shrink-0">{n}</span>
      <svg className="w-3 h-3 text-old-gold shrink-0" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
      <div className="flex-1 bg-forest-green/8 rounded-full h-1.5 overflow-hidden">
        <div className="h-full rounded-full bg-old-gold transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-forest-green/40 w-5 text-right shrink-0">{count}</span>
    </div>
  );
}

// ── Modais ────────────────────────────────────────────────────────────────────

function ModalMensagem({ produtor, onClose }) {
  const [form, setForm] = useState({ nome: "", email: "", whatsapp: "", mensagem: "" });
  const [enviado, setEnviado] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  const CAMPO = "w-full min-h-[44px] px-4 py-2.5 rounded-xl border-2 border-forest-green/15 bg-silk-cream text-sm text-forest-green focus:outline-none focus:border-old-gold transition-colors";
  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function handleEnviar(e) {
    e.preventDefault();
    setEnviando(true);
    setErro(null);
    try {
      await mensagemService.enviar(produtor.id, {
        remetente: form.nome,
        emailRemetente: form.email,
        whatsappRemetente: form.whatsapp,
        conteudo: form.mensagem,
      });
      setEnviado(true);
    } catch {
      setErro("Erro ao enviar mensagem. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        {enviado ? (
          <div className="text-center py-4">
            <div className="text-5xl mb-3">✅</div>
            <h3 className="font-serif text-lg font-bold text-forest-green">Mensagem enviada!</h3>
            <p className="text-sm text-forest-green/55 mt-1">
              {produtor.nome.split(" ")[0]} foi notificado e entrará em contato em breve.
            </p>
            <button onClick={onClose} className="mt-4 px-6 py-2.5 bg-forest-green text-silk-cream rounded-xl font-semibold text-sm hover:bg-old-gold hover:text-forest-green transition-colors">
              Fechar
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-lg font-bold text-forest-green">Enviar Mensagem</h3>
              <button onClick={onClose} className="text-forest-green/40 hover:text-forest-green text-xl leading-none">✕</button>
            </div>
            <form onSubmit={handleEnviar} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-forest-green">Seu nome <span className="text-old-gold">*</span></label>
                <input name="nome" required value={form.nome} onChange={change} placeholder="Como você se chama?" className={CAMPO} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-forest-green">E-mail <span className="text-old-gold">*</span></label>
                  <input name="email" type="email" required value={form.email} onChange={change} placeholder="seu@email.com" className={CAMPO} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-forest-green">WhatsApp</label>
                  <input name="whatsapp" type="tel" value={form.whatsapp} onChange={change} placeholder="(00) 00000-0000" className={CAMPO} />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-forest-green">Mensagem <span className="text-old-gold">*</span></label>
                <textarea name="mensagem" required rows={4} value={form.mensagem} onChange={change}
                  placeholder="Escreva sua mensagem..." className={`${CAMPO} resize-none min-h-0`} />
              </div>
              {erro && <p role="alert" className="text-sm text-red-700 bg-red-50 px-3 py-2 rounded-xl border border-red-200">{erro}</p>}
              <button type="submit" disabled={enviando}
                className="w-full min-h-[48px] bg-forest-green text-silk-cream rounded-xl font-bold text-sm hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-40">
                {enviando ? "Enviando..." : "Enviar Mensagem"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

function ModalAvaliacao({ produtor, onClose, onSalvo }) {
  const [form, setForm] = useState({ nomeAvaliador: "", nota: 0, comentario: "" });
  const [salvando, setSalvando] = useState(false);
  const CAMPO = "w-full min-h-[44px] px-4 py-2.5 rounded-xl border-2 border-forest-green/15 bg-silk-cream text-sm text-forest-green focus:outline-none focus:border-old-gold transition-colors";

  async function handleEnviar(e) {
    e.preventDefault();
    if (form.nota === 0) return alert("Selecione uma nota.");
    setSalvando(true);
    try {
      await avaliacaoService.criar({ ...form, produtorId: produtor.id });
      onSalvo();
      onClose();
    } catch { alert("Erro ao salvar avaliação."); }
    finally { setSalvando(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-bold text-forest-green">Avaliar {produtor.nome.split(" ")[0]}</h3>
          <button onClick={onClose} className="text-forest-green/40 hover:text-forest-green text-xl">✕</button>
        </div>
        <form onSubmit={handleEnviar} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-forest-green">Seu nome *</label>
            <input required value={form.nomeAvaliador} onChange={(e) => setForm((p) => ({ ...p, nomeAvaliador: e.target.value }))} placeholder="Como você se chama?" className={CAMPO} />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-forest-green">Nota *</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} type="button" onClick={() => setForm((p) => ({ ...p, nota: n }))}
                  className={`w-11 h-11 rounded-xl text-xl transition-all ${form.nota >= n ? "bg-old-gold/25 scale-110" : "bg-forest-green/5 hover:bg-old-gold/10"}`}>
                  ⭐
                </button>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-forest-green">Comentário</label>
            <textarea rows={3} value={form.comentario} onChange={(e) => setForm((p) => ({ ...p, comentario: e.target.value }))}
              placeholder="Conte sua experiência..." className={`${CAMPO} resize-none min-h-0`} />
          </div>
          <button type="submit" disabled={salvando || form.nota === 0}
            className="w-full min-h-[48px] bg-forest-green text-silk-cream rounded-xl font-bold text-sm hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-40">
            {salvando ? "Enviando..." : "Enviar Avaliação"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ── Página principal ──────────────────────────────────────────────────────────

export default function ProdutorProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [produtor, setProdutor] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState(0);
  const [produtos, setProdutos] = useState([]);
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [resumoAval, setResumoAval] = useState({ media: 0, total: 0, distribuicao: {} });
  const [modalMensagem, setModalMensagem] = useState(false);
  const [modalAvaliar, setModalAvaliar] = useState(false);

  useEffect(() => {
    produtorService.buscar(id).then((data) => setProdutor(enrichProdutor(data))).catch(() => navigate("/produtores"));
    produtoService.listarPorProdutor(id).then(setProdutos).catch(() => {});
    avaliacaoService.listarPorProdutor(id).then(setAvaliacoes).catch(() => {});
    avaliacaoService.resumo(id).then(setResumoAval).catch(() => {});
  }, [id]);

  function recarregarAvaliacoes() {
    avaliacaoService.listarPorProdutor(id).then(setAvaliacoes);
    avaliacaoService.resumo(id).then(setResumoAval);
  }

  if (!produtor) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-forest-green/40 animate-pulse text-lg">Carregando...</p>
      </div>
    );
  }

  const media = Number(resumoAval.media) || produtor.avaliacao || 0;
  const totalAval = resumoAval.total || 0;
  const dist = resumoAval.distribuicao || {};

  const ICONE_CATEGORIA = {
    CAFE:          "☕",
    MEL:           "🍯",
    CACHACA:       "🥃",
    ARTESANATO:    "🏺",
    LATICINIOS:    "🧀",
    AGROINDUSTRIA: "🌾",
    PESCA:         "🐟",
    HORTIFRUTI:    "🥬",
    COSMETICOS:    "🌸",
    DOCES:         "🍬",
  };
  const iconeProduto = ICONE_CATEGORIA[produtor.categoriaProd] || "📦";
  const localidadeCurta = (produtor.municipio || produtor.localidade || "—")
    .split(" ").slice(0, 2).join(" ");

  const stats = [
    { value: media.toFixed(1), label: "Avaliação", icon: "⭐" },
    { value: produtos.length || produtor.totalProdutos || 0, label: "Produtos", icon: iconeProduto },
    { value: localidadeCurta, label: "Localidade", icon: "📍" },
    { value: `${produtor.anosAtivo} anos`, label: "de tradição", icon: "🌿" },
  ];

  // Cor de gradiente de fundo quando não há foto de banner
  const bannerGradient = `linear-gradient(135deg, ${produtor.catColor}88 0%, #0A1F11 100%)`;

  return (
    <div className="min-h-screen bg-silk-cream pb-28 md:pb-6">
      {/* Modais */}
      {modalMensagem && <ModalMensagem produtor={produtor} onClose={() => setModalMensagem(false)} />}
      {modalAvaliar && <ModalAvaliacao produtor={produtor} onClose={() => setModalAvaliar(false)} onSalvo={recarregarAvaliacoes} />}

      {/* ── Banner ── */}
      <div className="relative h-44 md:h-56">
        {produtor.fotoProducaoUrl ? (
          <img src={produtor.fotoProducaoUrl} alt="Produção" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full" style={{ background: bannerGradient }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Botões de navegação */}
        <div className="absolute top-4 left-0 right-0">
          <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex justify-between">
            <button onClick={() => navigate(-1)}
              className="w-9 h-9 bg-black/35 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button className="w-9 h-9 bg-black/35 backdrop-blur-sm rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" />
                <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Cabeçalho: foto circular sobreposta + nome + ghost buttons ── */}
      <div className="relative z-10 bg-white border-b border-forest-green/8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">

          {/* Linha 1: avatar + info */}
          <div className="flex items-end gap-3 -mt-12 pt-0 pb-3">

            {/* Avatar circular com borda old-gold — sobrepõe o banner */}
            <div className="shrink-0 w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-old-gold bg-white shadow-xl overflow-hidden z-10 relative">
              {produtor.fotoUrl ? (
                <img src={produtor.fotoUrl} alt={produtor.nome} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: produtor.catColor + "22" }}>
                  <span className="font-serif text-3xl sm:text-4xl font-bold" style={{ color: produtor.catColor }}>
                    {produtor.nome.charAt(0)}
                  </span>
                </div>
              )}
            </div>

            {/* Info: badges, nome, localidade, avaliação */}
            <div className="flex-1 min-w-0 self-end pb-0.5">
              <div className="flex items-center gap-1.5 flex-wrap mb-1">
                {produtor.verificado && (
                  <span className="text-[10px] font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                    ✓ Verificado
                  </span>
                )}
                {produtor.titulo && (
                  <span className="text-[10px] font-semibold text-old-gold bg-old-gold/12 px-2 py-0.5 rounded-full border border-old-gold/20">
                    {produtor.titulo}
                  </span>
                )}
              </div>
              <h1 className="font-serif text-lg sm:text-xl font-bold text-forest-green leading-tight">
                {produtor.nome}
              </h1>
              {(produtor.municipio || produtor.localidade) && (
                <p className="text-xs text-forest-green/55 mt-0.5">
                  📍 {produtor.municipio || produtor.localidade}
                </p>
              )}
              {media > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Estrelas nota={media} />
                  <span className="text-xs text-forest-green/50">{media.toFixed(1)}</span>
                </div>
              )}
            </div>

            {/* Ghost buttons — apenas em telas maiores (mobile usa barra fixa do rodapé) */}
            <div className="hidden sm:flex gap-2 self-end pb-0.5 shrink-0">
              <GhostBtn
                onClick={() => setModalMensagem(true)}
                label="Mensagem"
                icon={
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                }
              />
              <GhostBtn
                onClick={() => setModalAvaliar(true)}
                label="Avaliar"
                icon={<span className="text-sm leading-none">⭐</span>}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="bg-white border-b border-forest-green/8">
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-4 divide-x divide-forest-green/8">
            {stats.map(({ value, label, icon }) => (
              <div key={label} className="flex flex-col items-center py-4 gap-0.5 px-1 min-w-0">
                <span className="text-base">{icon}</span>
                <span className="font-bold text-forest-green text-sm leading-tight truncate w-full text-center">{value}</span>
                <span className="text-[10px] text-forest-green/45 truncate w-full text-center">{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="bg-white border-b border-forest-green/8 sticky top-0 z-10">
        <div className="container mx-auto max-w-7xl overflow-x-auto">
          <div className="flex min-w-max">
            {TABS.map((tab, i) => (
              <button key={tab} onClick={() => setAbaAtiva(i)}
                className={`flex-1 min-w-[90px] py-3 text-sm font-semibold transition-all border-b-2 ${
                  abaAtiva === i ? "text-forest-green border-old-gold" : "text-forest-green/40 border-transparent"
                }`}>
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Conteúdo das abas ── */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6">

        {/* Nossa História */}
        {abaAtiva === 0 && (
          <div className="flex flex-col gap-5 max-w-2xl">
            {produtor.bio && (
              <blockquote className="border-l-4 border-old-gold pl-4 py-1">
                <p className="text-forest-green/80 text-sm leading-relaxed italic">"{produtor.bio}"</p>
              </blockquote>
            )}
            {produtor.narrativa && (
              <div className="bg-forest-green/5 rounded-2xl p-5 border border-forest-green/10">
                <p className="text-[10px] font-bold text-old-gold uppercase tracking-widest mb-3">
                  Narrativa Cultural
                </p>
                <p className="text-sm text-forest-green leading-relaxed whitespace-pre-wrap">
                  {produtor.narrativa}
                </p>
              </div>
            )}
            {produtor.anoInicio && (
              <div className="flex items-center gap-2 text-sm text-forest-green/55">
                <span>🌿</span>
                <span>Ativo desde {produtor.anoInicio} · {produtor.anosAtivo} anos de tradição</span>
              </div>
            )}
            {!produtor.bio && !produtor.narrativa && (
              <p className="text-center text-forest-green/40 italic text-sm py-10">
                Biografia não informada.
              </p>
            )}
          </div>
        )}

        {/* Produtos */}
        {abaAtiva === 1 && (
          <div>
            {produtos.length === 0 ? (
              <p className="text-center text-forest-green/40 italic text-sm py-10">
                Nenhum produto cadastrado.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {produtos.map((p) => {
                  const cat = CATEGORIAS_PRODUTO.find((c) => c.value === p.categoria) || CATEGORIAS_PRODUTO[0];
                  return (
                    <div key={p.id} className="bg-white rounded-2xl shadow-sm border border-forest-green/10 overflow-hidden">
                      {p.fotoUrl ? (
                        <img src={p.fotoUrl} alt={p.nome} className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-24 flex items-center justify-center text-5xl"
                          style={{ backgroundColor: cat.cor + "12" }}>{cat.icon}</div>
                      )}
                      <div className="p-4 flex flex-col gap-1.5">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-semibold text-forest-green text-sm leading-tight">{p.nome}</p>
                          {p.preco && <span className="text-sm font-bold text-old-gold shrink-0">{p.preco}</span>}
                        </div>
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full w-fit"
                          style={{ backgroundColor: cat.cor + "18", color: cat.cor }}>{cat.label}</span>
                        <p className="text-xs text-forest-green/50">Disponível: {p.quantidade} un.</p>
                        {p.descricao && <p className="text-xs text-forest-green/60 mt-0.5 line-clamp-2">{p.descricao}</p>}
                        {p.contato && <p className="text-xs text-old-gold font-medium mt-1">📞 {p.contato}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Avaliações */}
        {abaAtiva === 2 && (
          <div className="flex flex-col gap-5 max-w-2xl">
            {/* Gráfico de distribuição */}
            <div className="bg-white rounded-2xl p-5 border border-forest-green/10 shadow-sm">
              <div className="flex items-start gap-5">
                <div className="text-center shrink-0">
                  <p className="text-5xl font-bold text-forest-green leading-none">{media.toFixed(1)}</p>
                  <Estrelas nota={media} tamanho="lg" />
                  <p className="text-xs text-forest-green/45 mt-1">{totalAval} avaliações</p>
                </div>
                <div className="flex-1 flex flex-col gap-2">
                  {[5, 4, 3, 2, 1].map((n) => (
                    <BarraEstrelas key={n} n={n} count={Number(dist[String(n)] || 0)} total={totalAval} />
                  ))}
                </div>
              </div>
            </div>

            {/* Lista de avaliações */}
            {avaliacoes.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-2xl border-2 border-dashed border-forest-green/15">
                <p className="text-forest-green/40 text-sm italic">Nenhuma avaliação ainda.</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {avaliacoes.map((a) => (
                  <div key={a.id} className="bg-white rounded-2xl p-4 border border-forest-green/10 shadow-sm">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="font-semibold text-forest-green text-sm">{a.nomeAvaliador}</p>
                        <Estrelas nota={a.nota} />
                      </div>
                      <span className="text-xs text-forest-green/40">
                        {new Date(a.dataCriacao).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    {a.comentario && (
                      <p className="text-sm text-forest-green/70 leading-relaxed">{a.comentario}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <GhostBtn
              onClick={() => setModalAvaliar(true)}
              label="Avaliar este produtor"
              icon={<span className="text-sm">⭐</span>}
              className="self-stretch justify-center min-h-[44px] rounded-2xl border-forest-green/25 text-forest-green"
            />
          </div>
        )}

        {/* Ações */}
        {abaAtiva === 3 && (
          <div className="flex flex-col gap-3 max-w-xs mx-auto pt-4">
            <div className="text-center mb-2">
              <div className="w-16 h-16 rounded-full border-2 border-old-gold bg-white shadow mx-auto mb-2 overflow-hidden">
                {produtor.fotoUrl ? (
                  <img src={produtor.fotoUrl} alt={produtor.nome} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl font-serif font-bold"
                    style={{ color: produtor.catColor, backgroundColor: produtor.catColor + "18" }}>
                    {produtor.nome.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="font-serif text-base font-bold text-forest-green">{produtor.nome}</h3>
              <p className="text-xs text-forest-green/50">{produtor.municipio || produtor.localidade || "Brasil"}</p>
            </div>

            <GhostBtn
              onClick={() => setModalMensagem(true)}
              label="Enviar Mensagem"
              icon={
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
              }
              className="justify-center min-h-[48px] rounded-2xl text-sm"
            />
            <GhostBtn
              onClick={() => setModalAvaliar(true)}
              label="Avaliar Produtor"
              icon={<span>⭐</span>}
              className="justify-center min-h-[48px] rounded-2xl text-sm"
            />
            {produtor.contato && (
              <div className="bg-forest-green/5 rounded-xl p-4 text-center mt-2">
                <p className="text-xs text-forest-green/45 mb-0.5">Contato direto</p>
                <p className="text-sm font-semibold text-forest-green">📞 {produtor.contato}</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Barra inferior mobile — ghost style ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-forest-green/10 z-40 md:hidden">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-3 flex gap-3">
          <GhostBtn
            onClick={() => setModalMensagem(true)}
            label="Enviar Mensagem"
            icon={
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            }
            className="flex-1 justify-center min-h-[44px] rounded-2xl text-sm"
          />
          <GhostBtn
            onClick={() => setModalAvaliar(true)}
            label="Avaliar"
            icon={<span>⭐</span>}
            className="min-h-[44px] rounded-2xl text-sm px-4"
          />
        </div>
      </div>
    </div>
  );
}
