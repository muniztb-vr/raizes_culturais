import { formatDateRange } from "../utils/produtorUtils";

const TIPO_CONFIG = {
  Feira:             { bg: "bg-emerald-600",  label: "Feira" },
  Capacitação:       { bg: "bg-purple-600",   label: "Capacitação" },
  Exposição:         { bg: "bg-blue-600",     label: "Exposição" },
  "Evento Cultural": { bg: "bg-amber-600",    label: "Evento Cultural" },
};

const GRADIENTES = {
  Feira:             "from-emerald-900/80",
  Capacitação:       "from-purple-900/80",
  Exposição:         "from-blue-900/80",
  "Evento Cultural": "from-amber-900/80",
};

export default function EventCard({ evento, vagasExpositor, vagasVisitante, onClick }) {
  const dateStr = formatDateRange(evento.dataInicio, evento.dataFim);

  // Suporta tanto mock (evento.imagem) quanto API (evento.fotoUrl)
  const fotoSrc = evento.fotoUrl || evento.imagem;

  const tipo = TIPO_CONFIG[evento.tipo] || { bg: "bg-gray-600", label: evento.tipo };
  const gradFrom = GRADIENTES[evento.tipo] || "from-gray-900/80";

  const totalExp = evento.vagasExpositor ?? 0;
  const restantesExp = vagasExpositor ?? totalExp;
  const expEsgotado = totalExp > 0 && restantesExp <= 0;
  const expBaixo = totalExp > 0 && restantesExp > 0 && restantesExp <= Math.ceil(totalExp * 0.2);

  const totalVis = evento.vagasVisitante ?? 0;
  const restantesVis = vagasVisitante ?? totalVis;
  const visEsgotado = totalVis > 0 && restantesVis <= 0;
  const visBaixo = totalVis > 0 && restantesVis > 0 && restantesVis <= Math.ceil(totalVis * 0.2);

  return (
    <article
      onClick={onClick}
      className="w-full bg-white rounded-3xl overflow-hidden cursor-pointer shadow-md
        hover:shadow-xl hover:-translate-y-1 active:scale-[0.99]
        transition-all duration-200 border border-forest-green/8"
    >
      {/* ── Hero com imagem ── */}
      <div className="relative h-52">
        {fotoSrc ? (
          <img
            src={fotoSrc}
            alt={evento.nome}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-forest-green to-forest-green/60 flex items-center justify-center">
            <span className="text-6xl opacity-30">📅</span>
          </div>
        )}

        {/* Gradiente de baixo para cima */}
        <div className={`absolute inset-0 bg-gradient-to-t ${gradFrom} via-transparent to-transparent`} />
        {/* Gradiente suave de cima */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-transparent" />

        {/* Badges superiores */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
          <span className={`${tipo.bg} text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm`}>
            {tipo.label}
          </span>
          {evento.entradaGratuita && (
            <span className="bg-white/95 backdrop-blur-sm text-green-700 text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
              ✓ Gratuito
            </span>
          )}
        </div>

        {/* Título e localização sobre a imagem */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h2 className="text-white font-serif text-xl font-bold leading-tight drop-shadow-md">
            {evento.nome}
          </h2>
          <p className="text-white/80 text-xs mt-0.5 flex items-center gap-1">
            <svg className="w-3 h-3 shrink-0" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            {evento.cidade}, {evento.estado}
            {evento.local && <span className="text-white/55"> · {evento.local}</span>}
          </p>
        </div>
      </div>

      {/* ── Corpo ── */}
      <div className="p-4 flex flex-col gap-3">

        {/* Data */}
        <div className="flex items-center gap-1.5 text-xs font-semibold text-forest-green/70">
          <svg className="w-3.5 h-3.5 text-old-gold shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <rect x="3" y="4" width="18" height="18" rx="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
          {dateStr}
          {evento.horario && <span className="text-forest-green/40 font-normal"> · {evento.horario}</span>}
        </div>

        {/* Descrição */}
        <p className="text-sm text-forest-green/65 leading-relaxed line-clamp-2">
          {evento.descricao}
        </p>

        {/* ── Barra de vagas + CTA ── */}
        <div className="flex flex-col gap-2 pt-2 border-t border-forest-green/8 mt-1">

          {/* Pills de vagas */}
          {(totalExp > 0 || totalVis > 0) && (
            <div className="flex flex-wrap gap-1.5">
              {totalExp > 0 && (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                  expEsgotado ? "bg-red-100 text-red-600"
                    : expBaixo  ? "bg-amber-100 text-amber-700"
                    : "bg-forest-green/10 text-forest-green"
                }`}>
                  🏺 {expEsgotado ? "Esgotado" : `${restantesExp}/${totalExp} exp.`}
                </span>
              )}
              {totalVis > 0 && (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${
                  visEsgotado ? "bg-red-100 text-red-600"
                    : visBaixo  ? "bg-amber-100 text-amber-700"
                    : "bg-blue-50 text-blue-700"
                }`}>
                  👥 {visEsgotado ? "Esgotado" : `${restantesVis}/${totalVis} vis.`}
                </span>
              )}
            </div>
          )}

          {/* CTA */}
          <div className="flex items-center justify-between">
            {totalExp === 0 && totalVis === 0 && (
              <span className="text-xs text-forest-green/40">
                {(evento.visitantesEsperados ?? 0).toLocaleString("pt-BR")} esperados
              </span>
            )}
            <span className="ml-auto text-xs font-bold text-old-gold flex items-center gap-0.5">
              Ver detalhes
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
