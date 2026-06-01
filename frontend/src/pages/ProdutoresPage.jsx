import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { produtorService } from "../services/produtorService";
import { enrichProdutor, CATS_PRINCIPAIS } from "../utils/produtorUtils";
import { CATEGORIAS_PRODUTO } from "../services/produtoService";
import ProducerListItem from "../components/ProducerListItem";

export default function ProdutoresPage() {
  const [produtores, setProdutores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);
  const [catSelecionada, setCatSelecionada] = useState(null);
  const [catExpandida, setCatExpandida] = useState(false);
  const [searchParams] = useSearchParams();
  const busca = searchParams.get("q") || "";

  useEffect(() => {
    produtorService
      .listar()
      .then((data) => setProdutores(data.map(enrichProdutor)))
      .catch(() => setErro("Não foi possível carregar os produtores."))
      .finally(() => setCarregando(false));
  }, []);

  const catsPrincipais = CATEGORIAS_PRODUTO.filter((c) => CATS_PRINCIPAIS.includes(c.value));
  const catsDemais = CATEGORIAS_PRODUTO.filter((c) => !CATS_PRINCIPAIS.includes(c.value));

  const produtoresFiltrados = produtores.filter((p) => {
    const matchCat = !catSelecionada || p.categoriaProd === catSelecionada;
    const matchBusca = !busca || p.nome.toLowerCase().includes(busca.toLowerCase());
    return matchCat && matchBusca;
  });

  const chipBase = "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap";
  const chipAtivo = `${chipBase} bg-forest-green text-silk-cream border-forest-green`;
  const chipInativo = `${chipBase} bg-white text-forest-green/60 border-forest-green/20 hover:border-forest-green/50`;

  return (
    <main className="min-h-screen bg-silk-cream pb-44 md:pb-10">

      {/* ── Cabeçalho ── */}
      <div className="bg-forest-green py-8 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="font-serif text-2xl font-bold text-silk-cream">Produtores Culturais</h1>
          <p className="text-silk-cream/60 text-sm mt-1">
            Conheça os guardiões das tradições e manifestações culturais da nossa região.
          </p>
        </div>
      </div>

      {/* ── Filtros de categoria ── */}
      <div className="sticky top-0 z-20 bg-silk-cream/95 backdrop-blur-sm border-b border-forest-green/8 py-3 px-4">
        <div className="container mx-auto max-w-3xl flex flex-wrap gap-2">
          <button
            onClick={() => setCatSelecionada(null)}
            className={catSelecionada === null ? chipAtivo : chipInativo}
          >
            Todas
          </button>

          {catsPrincipais.map((c) => (
            <button
              key={c.value}
              onClick={() => setCatSelecionada(catSelecionada === c.value ? null : c.value)}
              className={catSelecionada === c.value ? chipAtivo : chipInativo}
            >
              <span>{c.icon}</span>{c.label}
            </button>
          ))}

          {catsDemais.length > 0 && !catExpandida && (
            <button onClick={() => setCatExpandida(true)} className={chipInativo}>
              Ver todas +{catsDemais.length}
            </button>
          )}

          {catExpandida && catsDemais.map((c) => (
            <button
              key={c.value}
              onClick={() => setCatSelecionada(catSelecionada === c.value ? null : c.value)}
              className={catSelecionada === c.value ? chipAtivo : chipInativo}
            >
              <span>{c.icon}</span>{c.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Lista ── */}
      <div className="container mx-auto max-w-3xl px-4 pt-5">
        {busca && (
          <p className="text-sm text-forest-green/55 mb-3">
            Resultados para <strong>"{busca}"</strong>
          </p>
        )}

        {carregando && (
          <p className="text-forest-green/50 italic animate-pulse text-sm py-10 text-center">
            Carregando produtores...
          </p>
        )}

        {erro && (
          <p role="alert" className="text-red-600 text-sm py-10 text-center">{erro}</p>
        )}

        {!carregando && !erro && produtoresFiltrados.length === 0 && (
          <p className="text-forest-green/50 italic text-sm py-10 text-center">
            Nenhum produtor encontrado.
          </p>
        )}

        {!carregando && !erro && (
          <div className="flex flex-col gap-3">
            {produtoresFiltrados.map((p) => (
              <ProducerListItem key={p.id} produtor={p} />
            ))}
          </div>
        )}

        {!carregando && produtoresFiltrados.length > 0 && (
          <p className="text-center text-xs text-forest-green/35 mt-6">
            {produtoresFiltrados.length} produtor{produtoresFiltrados.length !== 1 ? "es" : ""} encontrado{produtoresFiltrados.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </main>
  );
}
