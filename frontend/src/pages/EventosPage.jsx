import { useState, useMemo, useEffect } from "react";
import { eventoService } from "../services/eventoService";
import EventCard from "../components/EventCard";
import EventDetailModal from "../components/EventDetailModal";
import ParticipacaoModal from "../components/ParticipacaoModal";

function initVagas(lista) {
  return Object.fromEntries(
    lista.map((e) => [e.id, {
      expositor: Math.max(0, e.vagasExpositor - (e.vagasExpositoresUsadas || 0)),
      visitante: Math.max(0, e.vagasVisitante - (e.vagasVisitantesUsadas || 0)),
    }])
  );
}

// Normaliza evento da API ou do mock para formato uniforme
function normalizar(ev) {
  return {
    ...ev,
    // mock usa "dataInicio"/"dataFim" como strings; API retorna LocalDate como string
    dataInicio: ev.dataInicio,
    dataFim:    ev.dataFim,
    vagasExpositor: ev.vagasExpositor ?? 0,
    vagasVisitante: ev.vagasVisitante ?? 0,
  };
}

export default function EventosPage() {
  const [eventos, setEventos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [inscricaoEvento, setInscricaoEvento] = useState(null);
  const [cidadeFiltro, setCidadeFiltro] = useState("Todas");
  const [vagas, setVagas] = useState({});

  useEffect(() => {
    eventoService.listarAtivos()
      .then((data) => {
        const norm = data.map(normalizar);
        setEventos(norm);
        setVagas(initVagas(norm));
      })
      .catch(() => {})
      .finally(() => setCarregando(false));
  }, []);

  const CIDADES = useMemo(() => {
    const unicas = [...new Set(eventos.map((e) => `${e.cidade}, ${e.estado}`))];
    return ["Todas", ...unicas];
  }, [eventos]);

  const eventosFiltrados = useMemo(() => {
    if (cidadeFiltro === "Todas") return eventos;
    return eventos.filter((e) => `${e.cidade}, ${e.estado}` === cidadeFiltro);
  }, [eventos, cidadeFiltro]);

  function abrirInscricao() {
    setInscricaoEvento(selectedEvento);
    setSelectedEvento(null);
  }

  function handleVagaUsada(eventoId, tipo, quantidade) {
    setVagas((prev) => ({
      ...prev,
      [eventoId]: {
        ...prev[eventoId],
        [tipo]: Math.max(0, (prev[eventoId]?.[tipo] ?? 0) - quantidade),
      },
    }));
  }

  return (
    <div className="min-h-screen bg-silk-cream pb-44 md:pb-6">
      <div className="bg-forest-green">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 pt-10 pb-8 text-center">
          <h1 className="font-serif text-3xl md:text-4xl text-silk-cream font-bold">
            Eventos Culturais
          </h1>
          <p className="text-silk-cream/60 text-base mt-3 max-w-2xl mx-auto">
            Explore a agenda de feiras e festivais. Uma oportunidade para conectar-se
            com as tradições e apoiar o artesanato local.
          </p>
        </div>
      </div>

      {/* Filtro por Localidade */}
      <div className="bg-white border-b border-forest-green/10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-forest-green/50 uppercase tracking-wider shrink-0">Localidade:</span>
            {CIDADES.map((cidade) => (
              <button key={cidade} onClick={() => setCidadeFiltro(cidade)}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap
                  transition-all duration-150 border ${
                  cidadeFiltro === cidade
                    ? "bg-forest-green text-silk-cream border-forest-green shadow-sm"
                    : "bg-white text-forest-green/70 border-forest-green/20 hover:border-forest-green/50"
                }`}>
                {cidade !== "Todas" && <span className="text-[10px]">📍</span>}
                {cidade}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto max-w-7xl px-4 sm:px-6 pt-8">
        {carregando ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1,2].map((i) => <div key={i} className="h-64 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : eventos.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-3xl border-2 border-dashed border-forest-green/10">
            <p className="text-forest-green/40 font-medium">Nenhum evento cadastrado no momento.</p>
            <p className="text-forest-green/30 text-sm mt-1">Aguarde os próximos eventos.</p>
          </div>
        ) : eventosFiltrados.length === 0 ? (
          <div className="text-center py-16 bg-white/50 rounded-3xl border-2 border-dashed border-forest-green/10">
            <p className="text-forest-green/40 font-medium">Nenhum evento encontrado para esta localidade.</p>
            <button onClick={() => setCidadeFiltro("Todas")}
              className="mt-4 px-4 py-2 border border-forest-green/25 text-forest-green text-sm rounded-full hover:bg-forest-green hover:text-silk-cream transition-colors">
              Ver todos os eventos
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-forest-green/50 mb-5">
              {eventosFiltrados.length} evento{eventosFiltrados.length !== 1 ? "s" : ""}
              {cidadeFiltro !== "Todas" ? ` em ${cidadeFiltro}` : " encontrados"}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {eventosFiltrados.map((ev) => (
                <div key={ev.id} className="flex justify-center">
                  <EventCard
                    evento={ev}
                    vagasExpositor={vagas[ev.id]?.expositor ?? ev.vagasExpositor}
                    vagasVisitante={vagas[ev.id]?.visitante ?? ev.vagasVisitante}
                    onClick={() => setSelectedEvento(ev)}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      <EventDetailModal
        evento={selectedEvento}
        vagas={selectedEvento ? vagas[selectedEvento.id] : null}
        onClose={() => setSelectedEvento(null)}
        onInscrever={abrirInscricao}
      />
      <ParticipacaoModal
        evento={inscricaoEvento}
        vagas={inscricaoEvento ? vagas[inscricaoEvento.id] : null}
        onClose={() => setInscricaoEvento(null)}
        onVagaUsada={(tipo, qtd) => handleVagaUsada(inscricaoEvento?.id, tipo, qtd)}
      />
    </div>
  );
}
