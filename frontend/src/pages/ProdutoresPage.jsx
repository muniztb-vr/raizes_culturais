import { useEffect, useState } from "react";
import { produtorService } from "../services/produtorService";
import { produtoService, CATEGORIAS_PRODUTO } from "../services/produtoService";
import { enrichProdutor, CATS_PRINCIPAIS } from "../utils/produtorUtils";
import ProducerListItem from "../components/ProducerListItem";

export default function ProdutoresPage() {
  const [produtores, setProdutores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [catSelecionada, setCatSelecionada] = useState(null);
  const [catExpandida, setCatExpandida] = useState(false);
  const [busca, setBusca] = useState("");

  useEffect(() => {
    let mounted = true;

    produtorService.listar().then((lista) =>
      Promise.all(
        lista.map((p) =>
          produtoService
            .listarPorProdutor(p.id)
            .then((prods) => ({ id: p.id, total: prods.length }))
            .catch(() => ({ id: p.id, total: 0 }))
        )
      ).then((contagens) => {
        if (!mounted) return;
        const mapa = {};
        contagens.forEach((c) => { mapa[c.id] = c.total; });
        setProdutores(
          lista.map((p) => enrichProdutor({ ...p, totalProdutos: mapa[p.id] ?? 0 }))
        );
        setCarregando(false);
      })
    ).catch(() => setCarregando(false));

    return () => { mounted = false; };
  }, []);

  const catsPrincipais = CATEGORIAS_PRODUTO.filter((c) => CATS_PRINCIPAIS.includes(c.value));
  const catsDemais    = CATEGORIAS_PRODUTO.filter((c) => !CATS_PRINCIPAIS.includes(c.value));

  const filtrados = produtores.filter((p) => {
    const matchCat  = !catSelecionada || p.categoriaProd === catSelecionada;
    const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  const chip = (ativo) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
      ativo
        ? "bg-forest-green text-silk-cream border-forest-green"
        : "bg-white text-forest-green/60 border-forest-green/20 hover:border-forest-green/50"
    }`;

  return (
    <main className="min-h-screen bg-silk-cream pb-44 md:pb-10">

      {/* ── Cabeçalho ── */}
      <div className="bg-forest-green py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-serif text-2xl font-bold text-silk-cream">
            Diretório de Produtores
          </h1>
          {!carregando && (
            <p className="text-silk-cream/60 text-sm mt-1">
              {produtores.length} produtor{produtores.length !== 1 ? "es" : ""} cadastrado{produtores.length !== 1 ? "s" : ""}
            </p>
          )}

          {/* Busca */}
          <div className="mt-4 relative">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-silk-cream/40"
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar produtores..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/10 border border-white/20
                text-silk-cream placeholder-silk-cream/40 text-sm focus:outline-none
                focus:bg-white/20 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* ── Filtros ── */}
      <div className="sticky top-0 z-20 bg-silk-cream/95 backdrop-blur-sm border-b border-forest-green/8 py-3 px-4">
        <div className="container mx-auto max-w-3xl flex flex-wrap gap-2">
          <button onClick={() => setCatSelecionada(null)} className={chip(!catSelecionada)}>
            Todos
          </button>

          {catsPrincipais.map((c) => (
            <button key={c.value}
              onClick={() => setCatSelecionada(catSelecionada === c.value ? null : c.value)}
              className={chip(catSelecionada === c.value)}>
              <span>{c.icon}</span>{c.label}
            </button>
          ))}

          {!catExpandida && catsDemais.length > 0 && (
            <button onClick={() => setCatExpandida(true)} className={chip(false)}>
              Ver todos
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
          )}

          {catExpandida && catsDemais.map((c) => (
            <button key={c.value}
              onClick={() => setCatSelecionada(catSelecionada === c.value ? null : c.value)}
              className={chip(catSelecionada === c.value)}>
              <span>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Lista ── */}
      <div className="container mx-auto max-w-3xl px-4 pt-5">
        {carregando ? (
          <p className="text-forest-green/50 italic animate-pulse text-sm py-10 text-center">
            Carregando produtores...
          </p>
        ) : filtrados.length === 0 ? (
          <p className="text-forest-green/50 italic text-sm py-10 text-center">
            Nenhum produtor encontrado.
          </p>
        ) : (
          <>
            <p className="text-xs text-forest-green/45 mb-3">
              {filtrados.length} resultado{filtrados.length !== 1 ? "s" : ""}
            </p>
            <div className="flex flex-col gap-3">
              {filtrados.map((p) => (
                <ProducerListItem key={p.id} produtor={p} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
