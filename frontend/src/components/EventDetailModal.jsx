import { formatDateRange } from "../utils/produtorUtils";

export default function EventDetailModal({ evento, vagas, onClose, onInscrever }) {
  if (!evento) return null;

  const dateStr = formatDateRange(evento.dataInicio, evento.dataFim);

  const handleVerNoMapa = () => {
    const q = encodeURIComponent(`${evento.local}, ${evento.cidade}, ${evento.estado}`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 p-4 flex flex-col justify-start items-center sm:justify-center">

      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/*
        Modal — divide-se em 3 camadas:
        ┌─────────────────────┐
        │  HEADER fixo        │  hero image + close + título
        ├─────────────────────┤
        │  BODY rolável       │  info, descrição, badge
        ├─────────────────────┤
        │  FOOTER fixo        │  botões de ação sempre visíveis
        └─────────────────────┘
      */}
      <div className="relative w-full sm:max-w-2xl bg-white rounded-3xl shadow-2xl
        flex flex-col max-h-[90vh] mt-4 sm:mt-0">

        {/* ── HEADER fixo ── */}
        <div className="relative h-48 sm:h-52 shrink-0 rounded-t-3xl overflow-hidden">
          {evento.fotoUrl || evento.imagem ? (
            <img
              src={evento.fotoUrl || evento.imagem}
              alt={evento.nome}
              className="w-full h-full object-cover"
              onError={(e) => { e.target.style.display = "none"; }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-forest-green to-forest-green/60
              flex items-center justify-center">
              <span className="text-6xl opacity-25">📅</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-black/10" />

          {/* Botão Fechar — toque mínimo 44×44px */}
          <button
            onClick={onClose}
            aria-label="Fechar modal"
            className="absolute top-3 right-3 w-11 h-11 bg-black/40 backdrop-blur-sm
              rounded-full flex items-center justify-center
              hover:bg-black/60 active:scale-95 transition-all"
          >
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Título e localização sobre a imagem */}
          <div className="absolute bottom-4 left-4 right-14">
            <h2 className="text-white font-serif text-xl sm:text-2xl font-bold leading-tight">
              {evento.nome}
            </h2>
            <p className="text-old-gold text-sm font-semibold mt-0.5">
              📍 {evento.cidade}, {evento.estado}
            </p>
          </div>
        </div>

        {/* ── BODY rolável ── */}
        <div className="flex-1 overflow-y-auto overscroll-contain px-5 pt-5 pb-0 flex flex-col gap-4">

          {/* Grid de informações */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "DATA",            value: dateStr },
              { label: "LOCAL",           value: evento.local },
              {
                label: "VAGAS EXPOSITOR",
                value: vagas?.expositor ?? evento.vagasExpositor,
                esgotado: (vagas?.expositor ?? evento.vagasExpositor) <= 0,
              },
              {
                label: "VAGAS VISITANTE",
                value: vagas?.visitante ?? evento.vagasVisitante,
                esgotado: (vagas?.visitante ?? evento.vagasVisitante) <= 0,
              },
            ].map(({ label, value, esgotado }) => (
              <div key={label} className="bg-silk-cream rounded-xl p-3">
                <p className="text-[10px] font-bold text-forest-green/40 uppercase tracking-wider">
                  {label}
                </p>
                <p className={`text-sm font-semibold mt-1 leading-snug ${
                  esgotado ? "text-red-500" : "text-forest-green"
                }`}>
                  {esgotado ? "Esgotado" : value}
                </p>
              </div>
            ))}
          </div>

          {/* Descrição */}
          <p className="text-sm text-forest-green/75 leading-relaxed">
            {evento.descricao}
          </p>

          {/* Entrada gratuita */}
          {evento.entradaGratuita && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm font-semibold text-green-700">
                Entrada gratuita para visitantes
              </span>
            </div>
          )}
        </div>

          {/* Botões lado a lado — parte do scroll */}
          <div className="flex gap-3 pt-1 pb-6">
            <button
              onClick={handleVerNoMapa}
              className="flex-1 min-h-[52px] border-2 border-old-gold text-forest-green rounded-2xl
                font-semibold text-sm hover:bg-old-gold/10 active:scale-[0.99] transition-all
                flex items-center justify-center gap-1.5"
            >
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Como Chegar
            </button>

            <button
              onClick={onInscrever}
              className="flex-1 min-h-[52px] bg-forest-green text-silk-cream rounded-2xl
                font-bold text-sm hover:bg-old-gold hover:text-forest-green
                active:scale-[0.99] transition-colors"
            >
              Confirmar Participação
            </button>
          </div>
      </div>
    </div>
  );
}

