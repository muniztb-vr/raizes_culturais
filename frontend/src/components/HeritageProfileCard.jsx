import { useState } from "react";
import { narrativaService } from "../services/narrativaService";

export default function HeritageProfileCard({ produtor }) {
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
      setErro("Não foi possível gerar a narrativa. Verifique sua conexão e tente novamente.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <article className="bg-silk-cream rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col border border-forest-green/10">

      {/* Cabeçalho: foto ou inicial decorativa */}
      <div className="relative">
        {fotoUrl ? (
          <img
            src={fotoUrl}
            alt={`Foto de ${nome}`}
            className="w-full h-52 object-cover"
          />
        ) : (
          <div className="w-full h-52 bg-forest-green flex items-center justify-center">
            <span className="text-8xl font-serif text-old-gold/60 select-none">
              {nome.charAt(0)}
            </span>
          </div>
        )}

        {/* Badge de localidade sobreposta à imagem */}
        {localidade && (
          <span className="absolute bottom-3 left-3 bg-old-gold text-forest-green text-xs font-bold px-3 py-1.5 rounded-full shadow">
            📍 {localidade}
          </span>
        )}
      </div>

      {/* Corpo do card */}
      <div className="p-6 flex flex-col gap-3 flex-1">

        {/* Nome — hierarquia tipográfica clara */}
        <h2 className="text-2xl font-serif font-bold text-forest-green leading-tight">
          {nome}
        </h2>

        {/* Bio — fonte sans, corpo legível */}
        {bio && (
          <p className="text-base font-sans text-forest-green/75 leading-relaxed">
            {bio}
          </p>
        )}

        {/* Contato com destaque dourado */}
        {contato && (
          <p className="text-sm font-semibold text-old-gold">
            ✉ {contato}
          </p>
        )}

        {/* Seção de narrativa gerada pela IA */}
        {narrativa && (
          <div className="mt-2 p-4 bg-forest-green/5 rounded-xl border-l-4 border-old-gold">
            <p className="text-xs font-bold text-old-gold uppercase tracking-widest mb-2">
              Narrativa Cultural
            </p>
            <p className="text-sm font-sans text-forest-green leading-relaxed italic">
              {narrativa}
            </p>
          </div>
        )}

        {/* Mensagem de erro acessível */}
        {erro && (
          <p role="alert" className="text-sm text-red-700 bg-red-50 p-3 rounded-lg border border-red-200">
            {erro}
          </p>
        )}

        {/* Botão principal — alvo tátil mínimo 48px, alto contraste */}
        <div className="mt-auto pt-4">
          <button
            onClick={handleGerarNarrativa}
            disabled={carregando}
            aria-busy={carregando}
            className="w-full min-h-[48px] py-3 px-6 rounded-xl text-base font-semibold
              transition-all duration-200
              bg-forest-green text-silk-cream
              hover:bg-old-gold hover:text-forest-green
              focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-old-gold
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {carregando
              ? "Gerando narrativa..."
              : narrativa
              ? "✦ Regenerar narrativa"
              : "✦ Gerar Narrativa Cultural"}
          </button>
        </div>
      </div>
    </article>
  );
}
