import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { produtorService } from "../services/produtorService";
import { CATEGORIAS_PRODUTO } from "../services/produtoService";
import { enrichProdutor, CATS_PRINCIPAIS } from "../utils/produtorUtils";
import ProducerListItem from "../components/ProducerListItem";

// ── Chips de categoria expansíveis ──────────────────────────────────────────

function FiltrosCategorias({ ativa, onSelect }) {
  const [expandido, setExpandido] = useState(false);

  const principais = CATEGORIAS_PRODUTO.filter((c) => CATS_PRINCIPAIS.includes(c.value));
  const demais    = CATEGORIAS_PRODUTO.filter((c) => !CATS_PRINCIPAIS.includes(c.value));

  const chip = (ativo) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap
     transition-all duration-150 border ${
       ativo
         ? "bg-forest-green text-silk-cream border-forest-green shadow-sm"
         : "bg-white text-forest-green/70 border-forest-green/20 hover:border-forest-green/50"
     }`;

  return (
    <div className="flex flex-col gap-2">
      {/* Linha 1: Todos + 4 principais + Ver todos */}
      <div className="flex flex-wrap gap-2">
        <button className={chip(ativa === "Todos")} onClick={() => onSelect("Todos")}>
          Todos
        </button>
        {principais.map((c) => (
          <button key={c.value} className={chip(ativa === c.value)} onClick={() => onSelect(c.value)}>
            <span>{c.icon}</span>{c.label}
          </button>
        ))}
        <button
          onClick={() => setExpandido((v) => !v)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold
            text-old-gold border border-old-gold/30 hover:bg-old-gold/10 transition-all duration-150"
        >
          {expandido ? "Menos" : "Ver todos"}
          <svg
            className={`w-3 h-3 transition-transform duration-300 ${expandido ? "rotate-180" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Linha 2: demais categorias — expansão suave */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expandido ? "max-h-40 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-wrap gap-2 pt-1">
          {demais.map((c) => (
            <button key={c.value} className={chip(ativa === c.value)} onClick={() => { onSelect(c.value); setExpandido(false); }}>
              <span>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Página ───────────────────────────────────────────────────────────────────

export default function ProdutoresDirectoryPage() {
  const [searchParams] = useSearchParams();
  const [produtores, setProdutores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState(searchParams.get("q") || "");
  const [categoriaAtiva, setCategoriaAtiva] = useState(
    searchParams.get("cat") || "Todos"
  );

  useEffect(() => {
    produtorService
      .listar()
      .then((data) => setProdutores(data.map(enrichProdutor)))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = useMemo(() => {
    return produtores.filter((p) => {
      const matchCat = categoriaAtiva === "Todos" || p.categoriaProd === categoriaAtiva;
      const q = busca.toLowerCase();
      const matchBusca =
        !q ||
        p.nome.toLowerCase().includes(q) ||
        (p.municipio || p.localidade || "").toLowerCase().includes(q) ||
        (p.catLabel || "").toLowerCase().includes(q);
      return matchCat && matchBusca;
    });
  }, [produtores, busca, categoriaAtiva]);

  return (
    <div className="min-h-screen bg-silk-cream pb-44 md:pb-6">

      {/* ── Header ── */}
      <div className="bg-forest-green">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-6 pb-5">
          <h1 className="font-serif text-2xl text-silk-cream font-bold">
            Diretório de Produtores
          </h1>
          <p className="text-silk-cream/55 text-sm mt-0.5">
            {carregando ? "Carregando..." : `${produtores.length} produtores cadastrados`}
          </p>

          <div className="flex items-center gap-2 bg-white/15 border border-white/20 rounded-2xl px-4 py-2 mt-4">
            <svg className="w-4 h-4 text-silk-cream/50 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produtores..."
              className="flex-1 bg-transparent text-sm text-silk-cream placeholder-silk-cream/50 outline-none py-1"
            />
          </div>
        </div>
      </div>

      {/* ── Filtros expansíveis ── */}
      <div className="bg-white border-b border-forest-green/10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <FiltrosCategorias ativa={categoriaAtiva} onSelect={setCategoriaAtiva} />
        </div>
      </div>

      {/* ── Resultados ── */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 mt-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm text-forest-green/55">{filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}</p>
        </div>

        <div className="flex flex-col gap-3">
          {carregando ? (
            <p className="text-center text-forest-green/40 py-10 animate-pulse">
              Carregando produtores...
            </p>
          ) : filtrados.length === 0 ? (
            <p className="text-center text-forest-green/40 py-10 italic">
              Nenhum produtor encontrado.
            </p>
          ) : (
            filtrados.map((p) => <ProducerListItem key={p.id} produtor={p} />)
          )}
        </div>
      </div>
    </div>
  );
}
