import { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { produtorService } from "../services/produtorService";
import { produtoService, CATEGORIAS_PRODUTO } from "../services/produtoService";
import { CATS_PRINCIPAIS } from "../utils/produtorUtils";

// ── Chips de categoria expansíveis ──────────────────────────────────────────

function FiltrosCategorias({ ativa, onSelect }) {
  const [expandido, setExpandido] = useState(false);

  const principais = CATEGORIAS_PRODUTO.filter((c) => CATS_PRINCIPAIS.includes(c.value));
  const demais     = CATEGORIAS_PRODUTO.filter((c) => !CATS_PRINCIPAIS.includes(c.value));

  const chip = (ativo) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap
     transition-all duration-150 border ${
       ativo
         ? "bg-forest-green text-silk-cream border-forest-green shadow-sm"
         : "bg-white text-forest-green/70 border-forest-green/20 hover:border-forest-green/50"
     }`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <button className={chip(ativa === "TODOS")} onClick={() => onSelect("TODOS")}>
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

      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          expandido ? "max-h-40 opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-wrap gap-2 pt-1">
          {demais.map((c) => (
            <button
              key={c.value}
              className={chip(ativa === c.value)}
              onClick={() => { onSelect(c.value); setExpandido(false); }}
            >
              <span>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function VitrinePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const catFiltro = searchParams.get("cat") || "TODOS";

  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    async function carregar() {
      try {
        const produtores = await produtorService.listar();
        const resultados = await Promise.allSettled(
          produtores.map((p) =>
            produtoService.listarPorProdutor(p.id).then((produtos) =>
              produtos.map((prod) => ({
                ...prod,
                produtorNome: p.nome,
                produtorId: p.id,
                produtorFoto: p.fotoUrl,
                produtorMunicipio: p.municipio || p.localidade || "Brasil",
              }))
            )
          )
        );
        const todos = resultados
          .filter((r) => r.status === "fulfilled")
          .flatMap((r) => r.value);
        setItens(todos);
      } catch {
        setItens([]);
      } finally {
        setCarregando(false);
      }
    }
    carregar();
  }, []);

  const itensFiltrados = useMemo(() => {
    let lista = itens;
    if (catFiltro !== "TODOS") lista = lista.filter((i) => i.categoria === catFiltro);
    if (busca.trim()) {
      const q = busca.toLowerCase();
      lista = lista.filter(
        (i) =>
          i.nome.toLowerCase().includes(q) ||
          i.produtorNome?.toLowerCase().includes(q) ||
          i.descricao?.toLowerCase().includes(q)
      );
    }
    return lista;
  }, [itens, catFiltro, busca]);

  function catInfo(val) {
    return CATEGORIAS_PRODUTO.find((c) => c.value === val) || CATEGORIAS_PRODUTO[0];
  }

  return (
    <div className="min-h-screen bg-silk-cream pb-44 md:pb-6">

      {/* Header */}
      <div className="bg-forest-green">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6">
          <p className="text-silk-cream/50 text-xs uppercase tracking-widest mb-1">Raízes Culturais</p>
          <h1 className="font-serif text-2xl text-silk-cream font-bold">Produtos — Vitrine Cultural</h1>
          <p className="text-silk-cream/65 text-sm mt-1">
            Produtos artesanais e culturais direto dos produtores
          </p>

          {/* Busca */}
          <div className="flex items-center gap-2 bg-white rounded-2xl px-4 py-1 shadow mt-4 max-w-lg">
            <svg className="w-4 h-4 text-forest-green/40 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produto, produtor..."
              className="flex-1 py-3 text-sm text-forest-green placeholder-forest-green/40 bg-transparent outline-none"
            />
            {busca && (
              <button onClick={() => setBusca("")} className="text-forest-green/30 hover:text-forest-green text-lg leading-none">✕</button>
            )}
          </div>
        </div>
      </div>

      {/* Filtros de categoria expansíveis */}
      <div className="bg-white border-b border-forest-green/10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <FiltrosCategorias
            ativa={catFiltro}
            onSelect={(val) => setSearchParams(val === "TODOS" ? {} : { cat: val })}
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-6">
        {carregando ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-40 bg-forest-green/10" />
                <div className="p-3 flex flex-col gap-2">
                  <div className="h-3 bg-forest-green/10 rounded w-3/4" />
                  <div className="h-3 bg-forest-green/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : itensFiltrados.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="font-serif text-lg font-bold text-forest-green mb-2">
              {busca || catFiltro !== "TODOS" ? "Nenhum produto encontrado" : "Nenhum produto cadastrado ainda"}
            </h3>
            <p className="text-sm text-forest-green/55">
              {busca || catFiltro !== "TODOS"
                ? "Tente outros filtros ou termos de busca."
                : "Os produtores ainda não cadastraram produtos."}
            </p>
            {(busca || catFiltro !== "TODOS") && (
              <button
                onClick={() => { setBusca(""); setSearchParams({}); }}
                className="mt-4 px-4 py-2 border border-forest-green/25 text-forest-green text-sm rounded-full hover:bg-forest-green hover:text-silk-cream transition-colors"
              >
                Limpar filtros
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs text-forest-green/45 mb-4">
              {itensFiltrados.length} produto{itensFiltrados.length !== 1 ? "s" : ""} encontrado{itensFiltrados.length !== 1 ? "s" : ""}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {itensFiltrados.map((item) => {
                const cat = catInfo(item.categoria);
                return (
                  <button
                    key={`${item.produtorId}-${item.id}`}
                    onClick={() => navigate(`/produtores/${item.produtorId}`)}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm text-left
                      hover:shadow-md active:scale-[0.98] transition-all"
                  >
                    {/* Foto */}
                    {item.fotoUrl ? (
                      <img src={item.fotoUrl} alt={item.nome} className="w-full h-40 object-cover" />
                    ) : (
                      <div className="w-full h-40 flex items-center justify-center text-5xl"
                        style={{ backgroundColor: cat.cor + "15" }}>
                        {cat.icon}
                      </div>
                    )}

                    <div className="p-3 flex flex-col gap-1.5">
                      {/* Categoria */}
                      <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full w-fit"
                        style={{ backgroundColor: cat.cor + "18", color: cat.cor }}>
                        {cat.icon} {cat.label}
                      </span>

                      {/* Nome */}
                      <p className="font-semibold text-forest-green text-sm leading-tight line-clamp-2">
                        {item.nome}
                      </p>

                      {/* Preço */}
                      {item.preco && (
                        <p className="text-sm font-bold text-old-gold">{item.preco}</p>
                      )}

                      {/* Quantidade */}
                      <p className="text-xs text-forest-green/50">
                        {item.quantidade > 0 ? `${item.quantidade} disponível` : "Esgotado"}
                      </p>

                      {/* Produtor */}
                      <div className="flex items-center gap-1.5 mt-0.5 pt-2 border-t border-forest-green/8">
                        {item.produtorFoto ? (
                          <img src={item.produtorFoto} alt={item.produtorNome}
                            className="w-5 h-5 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-forest-green/15 flex items-center justify-center shrink-0">
                            <span className="text-[9px] font-bold text-forest-green">
                              {item.produtorNome?.charAt(0)}
                            </span>
                          </div>
                        )}
                        <p className="text-[11px] text-forest-green/60 truncate">
                          {item.produtorNome}
                        </p>
                      </div>

                      {/* Contato */}
                      {item.contato && (
                        <p className="text-[11px] text-old-gold font-medium">📞 {item.contato}</p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
