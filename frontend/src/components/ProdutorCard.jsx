import { useState } from "react";
import { narrativaService } from "../services/narrativaService";

export default function ProdutorCard({ produtor }) {
  const { nome, bio, localidade, contato, fotoUrl } = produtor;

  const [narrativa, setNarrativa] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);

  async function handleGerarNarrativa() {
    setCarregando(true);
    setErro(null);
    try {
      const data = await narrativaService.gerar(produtor);
      setNarrativa(data.narrativa);
    } catch {
      setErro("Não foi possível gerar a narrativa. Tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <article className="bg-white rounded-2xl shadow hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
      {fotoUrl ? (
        <img
          src={fotoUrl}
          alt={`Foto de ${nome}`}
          className="w-full h-48 object-cover"
        />
      ) : (
        <div className="w-full h-48 bg-forest-green/10 flex items-center justify-center">
          <span className="text-4xl text-forest-green/30 font-serif select-none">
            {nome.charAt(0)}
          </span>
        </div>
      )}

      <div className="p-5 flex flex-col gap-2 flex-1">
        <h2 className="text-xl font-serif font-bold text-forest-green leading-snug">
          {nome}
        </h2>

        {localidade && (
          <p className="text-sm text-forest-green/60 font-medium">
            📍 {localidade}
          </p>
        )}

        {bio && (
          <p className="text-sm text-forest-green/80 line-clamp-3 leading-relaxed">
            {bio}
          </p>
        )}

        {contato && (
          <p className="pt-3 border-t border-forest-green/10 text-sm text-old-gold font-medium">
            {contato}
          </p>
        )}

        {/* Narrativa gerada */}
        {narrativa && (
          <div className="mt-3 pt-3 border-t border-old-gold/30">
            <p className="text-xs font-semibold text-old-gold uppercase tracking-wider mb-2">
              Narrativa Cultural
            </p>
            <p className="text-sm text-forest-green/80 leading-relaxed italic">
              {narrativa}
            </p>
          </div>
        )}

        {erro && (
          <p className="mt-2 text-xs text-red-500">{erro}</p>
        )}

        {/* Botão */}
        <div className="mt-auto pt-4">
          <button
            onClick={handleGerarNarrativa}
            disabled={carregando}
            className="w-full py-2 px-4 rounded-xl text-sm font-medium transition-colors
              bg-forest-green text-silk-cream hover:bg-old-gold hover:text-forest-green
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {carregando ? "Gerando..." : narrativa ? "Gerar novamente" : "✦ Gerar Narrativa"}
          </button>
        </div>
      </div>
    </article>
  );
}
