import { useEffect, useState } from "react";
import { produtorService } from "../services/produtorService";
import HeritageProfileCard from "../components/HeritageProfileCard";

export default function ProdutoresPage() {
  const [produtores, setProdutores] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    produtorService
      .listar()
      .then(setProdutores)
      .catch(() => setErro("Não foi possível carregar os produtores."))
      .finally(() => setCarregando(false));
  }, []);

  if (carregando) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <p className="text-forest-green/60 font-sans animate-pulse text-lg">
          Carregando produtores...
        </p>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="flex justify-center items-center min-h-[40vh]">
        <p role="alert" className="text-red-600 font-sans">
          {erro}
        </p>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-serif text-forest-green">
          Produtores Culturais
        </h1>
        <p className="mt-2 text-base font-sans text-forest-green/60 leading-relaxed">
          Conheça os guardiões das tradições e manifestações culturais da nossa região.
        </p>
      </header>

      {produtores.length === 0 ? (
        <p className="text-forest-green/50 font-sans italic text-lg">
          Nenhum produtor cadastrado ainda.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtores.map((p) => (
            <HeritageProfileCard key={p.id} produtor={p} />
          ))}
        </div>
      )}
    </main>
  );
}
