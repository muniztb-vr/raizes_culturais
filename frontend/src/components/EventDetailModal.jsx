import { formatDateRange } from "../utils/produtorUtils";

export default function EventDetailModal({ evento, vagas, onClose, onInscrever }) {
  if (!evento) return null;

  const dateStr = formatDateRange(evento.dataInicio, evento.dataFim);

  // Função para abrir o Google Maps com o endereço do evento
  const handleVerNoMapa = () => {
    const enderecoCompleto = `${evento.local}, ${evento.cidade}, ${evento.estado}`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      enderecoCompleto
    )}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full md:max-w-2xl bg-white rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Hero */}
        <div className="relative h-52">
          <img
            src={evento.fotoUrl || evento.imagem}
            alt={evento.nome}
            className="w-full h-full object-cover"
            onError={(e) => { e.target.style.display = "none"; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Botão Fechar */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-white/90 rounded-full flex items-center justify-center shadow"
          >
            <svg className="w-4 h-4 text-forest-green" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Título e Localização */}
          <div className="absolute bottom-4 left-4">
            <h2 className="text-white font-serif text-2xl font-bold leading-tight">
              {evento.nome}
            </h2>
            <p className="text-old-gold text-sm font-semibold mt-0.5">
              {evento.cidade}, {evento.estado}
            </p>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="p-5 flex flex-col gap-5">
          {/* Grid de Informações */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "DATA", value: dateStr },
              { label: "LOCAL", value: evento.local },
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
                <p className={`text-sm font-semibold mt-1 leading-snug ${esgotado ? "text-red-500" : "text-forest-green"}`}>
                  {esgotado ? "Esgotado" : value}
                </p>
              </div>
            ))}
          </div>

          {/* Descrição */}
          <p className="text-sm text-forest-green/75 leading-relaxed">
            {evento.descricao}
          </p>

          {/* Selo de Entrada Gratuita */}
          {evento.entradaGratuita && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 flex items-center gap-2">
              <span className="text-green-600">✅</span>
              <span className="text-sm font-semibold text-green-700">
                Entrada gratuita para visitantes
              </span>
            </div>
          )}

          {/* Ações do Usuário */}
          <div className="flex flex-col gap-3">
            {/* NOVO: Botão Como Chegar */}
            <button
              onClick={handleVerNoMapa}
              className="w-full min-h-[52px] border-2 border-old-gold text-forest-green rounded-2xl font-semibold text-base
                hover:bg-old-gold/10 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Como Chegar (Google Maps)
            </button>

            <button
              onClick={onInscrever}
              className="w-full min-h-[52px] bg-forest-green text-silk-cream rounded-2xl font-semibold text-base
                hover:bg-old-gold hover:text-forest-green transition-colors"
            >
              Confirmar Participação
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
