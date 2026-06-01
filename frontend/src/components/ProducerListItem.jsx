import { useNavigate } from "react-router-dom";

export default function ProducerListItem({ produtor }) {
  const navigate = useNavigate();

  return (
    <article
      onClick={() => navigate(`/produtores/${produtor.id}`)}
      className="flex gap-3 p-3 bg-white rounded-2xl shadow-sm cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
    >
      {/* Thumbnail */}
      <div className="relative shrink-0">
        {produtor.fotoUrl ? (
          <img
            src={produtor.fotoUrl}
            alt={produtor.nome}
            className="w-[72px] h-[72px] rounded-xl object-cover"
          />
        ) : (
          <div
            className="w-[72px] h-[72px] rounded-xl flex items-center justify-center"
            style={{ backgroundColor: produtor.catColor + "22" }}
          >
            <span className="text-2xl font-serif" style={{ color: produtor.catColor }}>
              {produtor.nome.charAt(0)}
            </span>
          </div>
        )}
        {produtor.verificado && (
          <span className="absolute -bottom-1.5 -right-1.5 bg-green-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full shadow">
            ✓ Verificado
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-0.5">
        <h3 className="font-semibold text-forest-green text-sm leading-tight">
          {produtor.nome}
        </h3>
        <p className="text-xs font-semibold mt-0.5 flex items-center gap-1" style={{ color: produtor.catColor }}>
          <span>{produtor.catIcon}</span>
          {produtor.catLabel}
        </p>
        {produtor.localidade && (
          <p className="text-xs text-forest-green/55 mt-0.5 flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            {produtor.localidade}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-forest-green/60">
          {produtor.totalAvaliacoes > 0 ? (
            <>
              <span className="flex items-center gap-0.5">
                <span className="text-yellow-500">★</span>
                {produtor.avaliacao}
              </span>
              <span>· {produtor.totalAvaliacoes} avaliações</span>
            </>
          ) : (
            <span className="text-forest-green/40 italic">Nenhuma avaliação</span>
          )}
          <span>· {produtor.totalProdutos} produto{produtor.totalProdutos !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Chevron */}
      <div className="self-center text-forest-green/30">
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </article>
  );
}
