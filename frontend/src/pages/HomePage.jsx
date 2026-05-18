import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { produtorService } from "../services/produtorService";
import { eventoService } from "../services/eventoService";
import { enrichProdutor, formatEventShort, CATS_PRINCIPAIS } from "../utils/produtorUtils";
import { CATEGORIAS_PRODUTO } from "../services/produtoService";
import { EVENTOS as MOCK_EVENTOS } from "../data/eventosMock";

export default function HomePage() {
  const navigate = useNavigate();
  const [produtores, setProdutores] = useState([]);
  const [eventos, setEventos] = useState([]);
  const [busca, setBusca] = useState("");
  const [catExpandida, setCatExpandida] = useState(false);

  useEffect(() => {
    produtorService.listar().then((data) => setProdutores(data.map(enrichProdutor))).catch(() => {});
    eventoService.listarAtivos()
      .then((data) => setEventos(data.length > 0 ? data : MOCK_EVENTOS))
      .catch(() => setEventos(MOCK_EVENTOS));
  }, []);

  function handleBusca(e) {
    e.preventDefault();
    navigate(`/produtores${busca ? `?q=${encodeURIComponent(busca)}` : ""}`);
  }

  const destaque = produtores.slice(0, 4);

  const catsPrincipais = CATEGORIAS_PRODUTO.filter((c) => CATS_PRINCIPAIS.includes(c.value));
  const catsDemais    = CATEGORIAS_PRODUTO.filter((c) => !CATS_PRINCIPAIS.includes(c.value));

  return (
    <div className="min-h-screen bg-silk-cream pb-44 md:pb-6">

      {/* ── Hero ── */}
      <section className="relative min-h-[20vw] max-h-[220px] bg-forest-green overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=1200&q=80"
          alt="Raízes Culturais"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-forest-green/70 via-forest-green/50 to-forest-green/90" />

        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-3 flex flex-col gap-1">
          <p className="text-silk-cream/60 text-xs uppercase tracking-widest font-semibold">
            Bem-vindo a
          </p>
          <p className="text-old-gold font-serif text-xl font-bold">
            Raízes Culturais
          </p>
        </div>

        <div className="relative container mx-auto max-w-7xl px-4 sm:px-6 pb-6 flex flex-col gap-3">
          <h1 className="font-serif text-3xl text-silk-cream leading-tight font-bold">
            Descubra a <span className="text-old-gold">Cultura Viva</span> do Campo
          </h1>
          <p className="text-silk-cream/70 text-sm leading-relaxed max-w-lg">
            Conectamos você a artesãos, saberes e tradições rurais do Brasil.
          </p>

          <form onSubmit={handleBusca} className="flex items-center gap-2 bg-white rounded-2xl px-4 py-1 shadow-lg mt-2 max-w-xl">
            <svg className="w-5 h-5 text-forest-green/40 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produtores, produtos..."
              className="flex-1 py-3 text-sm text-forest-green placeholder-forest-green/40 bg-transparent outline-none"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="w-9 h-9 bg-old-gold rounded-xl flex items-center justify-center shrink-0"
            >
              <svg className="w-4 h-4 text-forest-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </form>
        </div>
      </section>

      {/* ── Categorias com expansão ── */}
      <section className="mt-6">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg font-bold text-forest-green">Categorias</h2>
            <button onClick={() => navigate("/vitrine")} className="text-xs text-old-gold font-semibold flex items-center gap-0.5">
              Ver vitrine
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* 4 principais */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {catsPrincipais.map((cat) => (
              <button
                key={cat.value}
                onClick={() => navigate(`/vitrine?cat=${cat.value}`)}
                className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm
                  hover:shadow-md active:scale-[0.98] transition-all text-left"
              >
                <span className="text-2xl shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: cat.cor + "18" }}>
                  {cat.icon}
                </span>
                <span className="text-sm font-semibold text-forest-green leading-tight">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>

          {/* Demais — expansão suave */}
          <div
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              catExpandida ? "max-h-96 opacity-100 mt-3" : "max-h-0 opacity-0"
            }`}
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {catsDemais.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => navigate(`/vitrine?cat=${cat.value}`)}
                  className="flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-sm
                    hover:shadow-md active:scale-[0.98] transition-all text-left"
                >
                  <span className="text-2xl shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: cat.cor + "18" }}>
                    {cat.icon}
                  </span>
                  <span className="text-sm font-semibold text-forest-green leading-tight">
                    {cat.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Botão Ver todos / Menos */}
          <button
            onClick={() => setCatExpandida((v) => !v)}
            className="mt-3 flex items-center gap-1 text-xs font-semibold text-old-gold hover:underline transition-all"
          >
            {catExpandida ? "Menos" : `Ver todas (${catsDemais.length} mais)`}
            <svg
              className={`w-3.5 h-3.5 transition-transform duration-300 ${catExpandida ? "rotate-180" : ""}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </section>

      {/* ── Produtores em Destaque ── */}
      <section className="mt-6">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg font-bold text-forest-green">
              Produtores em Destaque
            </h2>
            <button onClick={() => navigate("/produtores")} className="text-xs text-old-gold font-semibold flex items-center gap-0.5">
              Ver todos
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {destaque.length > 0 ? (
          <div className="container mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
              {destaque.map((p) => (
                <button
                  key={p.id}
                  onClick={() => navigate(`/produtores/${p.id}`)}
                  className="shrink-0 snap-start w-40 bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md active:scale-95 transition-all text-left"
                >
                  <div className="relative h-28">
                    {p.fotoUrl ? (
                      <img src={p.fotoUrl} alt={p.nome} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: p.catColor + "22" }}>
                        <span className="text-4xl">{p.catIcon}</span>
                      </div>
                    )}
                    <span className={`absolute top-2 left-2 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${p.verificado ? "bg-green-500 text-white" : "bg-old-gold text-forest-green"}`}>
                      {p.verificado ? "Destaque" : "Novo"}
                    </span>
                  </div>
                  <div className="p-3">
                    <p className="font-semibold text-forest-green text-sm leading-tight">{p.nome}</p>
                    <p className="text-[11px] mt-0.5 flex items-center gap-0.5" style={{ color: p.catColor }}>
                      <span>{p.catIcon}</span>
                      {p.catLabel}
                    </p>
                    <p className="text-[11px] text-forest-green/55 mt-1">
                      ★ {p.avaliacao} ({p.totalAvaliacoes})
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="container mx-auto max-w-7xl px-4 sm:px-6 text-sm text-forest-green/40 italic">
            Carregando produtores...
          </p>
        )}
      </section>

      {/* ── Eventos em destaque ── */}
      <section className="mt-6">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-serif text-lg font-bold text-forest-green">Eventos</h2>
            <button onClick={() => navigate("/eventos")} className="text-xs text-old-gold font-semibold flex items-center gap-0.5">
              Ver todos
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col gap-3">
            {eventos.slice(0, 2).map((ev) => (
              <button
                key={ev.id}
                onClick={() => navigate("/eventos")}
                className="flex gap-3 bg-white rounded-2xl p-3 shadow-sm text-left hover:shadow-md active:scale-[0.99] transition-all"
              >
                <img
                  src={ev.fotoUrl || ev.imagem}
                  alt={ev.nome}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-forest-green text-sm leading-tight">{ev.nome}</p>
                  <p className="text-xs text-forest-green/55 mt-0.5">📅 {formatEventShort(ev)}</p>
                  {ev.entradaGratuita && (
                    <span className="inline-block mt-1 text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      Gratuito
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
