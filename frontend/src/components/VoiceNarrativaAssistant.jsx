import { useState, useRef, useEffect } from "react";
import { narrativaService } from "../services/narrativaService";
import { authService } from "../services/authService";
import { useAuth } from "../context/AuthContext";

const SpeechAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
const suportaVoz = !!SpeechAPI;

const IconMic = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
  </svg>
);

const IconStop = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M6 6h12v12H6z" />
  </svg>
);

const IconSpeaker = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
);

const IconCheck = ({ className = "w-4 h-4" }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

export default function VoiceNarrativaAssistant() {
  const { produtor, atualizarProdutor } = useAuth();
  const [texto, setTexto] = useState("");
  const [gravando, setGravando] = useState(false);
  const [processando, setProcessando] = useState(false);
  const [narrativa, setNarrativa] = useState(produtor?.narrativa || "");
  const [salvando, setSalvando] = useState(false);
  const [salvo, setSalvo] = useState(false);
  const [lendo, setLendo] = useState(false);
  const [erro, setErro] = useState(null);

  const recognitionRef = useRef(null);
  const finalRef = useRef("");
  const textareaRef = useRef(null);
  const ultimaChamadaRef = useRef(0);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  // ── Voz → texto (appenda ao textarea) ────────────────────────────────────

  function iniciarGravacao() {
    if (!suportaVoz) return;
    finalRef.current = "";
    setErro(null);
    setGravando(true);

    const rec = new SpeechAPI();
    rec.lang = "pt-BR";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalRef.current += e.results[i][0].transcript + " ";
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      // Mostra interim como placeholder visual no textarea
      textareaRef.current && (textareaRef.current.dataset.interim = interim);
    };

    rec.onend = () => {
      setGravando(false);
      if (finalRef.current.trim()) {
        setTexto((prev) =>
          prev ? prev.trimEnd() + " " + finalRef.current.trim() : finalRef.current.trim()
        );
      }
      if (textareaRef.current) textareaRef.current.dataset.interim = "";
    };

    rec.onerror = () => {
      setGravando(false);
      if (finalRef.current.trim()) {
        setTexto((prev) =>
          prev ? prev.trimEnd() + " " + finalRef.current.trim() : finalRef.current.trim()
        );
      }
    };

    recognitionRef.current = rec;
    rec.start();
  }

  function pararGravacao() {
    recognitionRef.current?.stop();
  }

  // ── Enviar para Gemini ────────────────────────────────────────────────────

  async function handleGerar() {
    const agora = Date.now();
    if (!texto.trim() || processando || agora - ultimaChamadaRef.current < 1000) return;
    ultimaChamadaRef.current = agora;
    setProcessando(true);
    setErro(null);
    try {
      const data = await narrativaService.gerar(texto.trim());
      setNarrativa(data.narrativa);
    } catch (err) {
      const status = err.response?.status;
      const msg = err.response?.data?.message || err.response?.data?.detail || err.message;
      console.error(`[Narrativa] Erro ${status || "rede"} ao chamar /narrativa/produtor:`, msg, err.response?.data);
      const mensagemUsuario =
        status === 503 ? (msg || "Serviço de IA indisponível. Tente novamente.") :
        status === 429 ? "Limite de requisições atingido. Aguarde 1 minuto e tente novamente." :
        status === 403 ? "Chave da API Gemini inválida. Contate o administrador." :
        status === 404 ? "Modelo de IA não encontrado. Contate o administrador." :
        "Não foi possível gerar a narrativa. Verifique a conexão.";
      setErro(mensagemUsuario);
    } finally {
      setProcessando(false);
    }
  }

  // ── Salvar narrativa no perfil ────────────────────────────────────────────

  async function handleSalvar() {
    if (!narrativa || !produtor?.id) return;
    setSalvando(true);
    setErro(null);
    try {
      const atualizado = await authService.atualizarNarrativa(produtor.id, narrativa);
      atualizarProdutor({ narrativa: atualizado.narrativa });
      setSalvo(true);
      setTimeout(() => setSalvo(false), 4000);
    } catch {
      setErro("Erro ao salvar. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  // ── Texto-para-voz ────────────────────────────────────────────────────────

  function ouvirNarrativa() {
    if (lendo) {
      window.speechSynthesis.cancel();
      setLendo(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(narrativa);
    utter.lang = "pt-BR";
    utter.rate = 0.88;
    utter.onend = () => setLendo(false);
    utter.onerror = () => setLendo(false);
    setLendo(true);
    window.speechSynthesis.speak(utter);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-5 max-w-2xl mx-auto">

      {/* Instrução */}
      <div className="flex items-start gap-3 bg-forest-green/5 border border-forest-green/10 rounded-2xl px-4 py-3">
        <span className="text-xl shrink-0 mt-0.5">✍️</span>
        <p className="text-sm text-forest-green/70 leading-relaxed">
          <strong className="text-forest-green">Digite ou fale</strong> sobre sua tradição,
          família e ofício. Use o microfone para ditar — a transcrição aparece no campo e você
          pode editar antes de gerar a narrativa.
        </p>
      </div>

      {/* Textarea com microfone flutuante */}
      <div className="relative">
        {/* Indicador de gravação */}
        {gravando && (
          <div className="absolute top-3 left-3 right-14 flex items-center gap-1.5 z-10 pointer-events-none">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
            <span className="text-xs text-red-500 font-semibold">Gravando em português... fale agora</span>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={9}
          placeholder={
            gravando
              ? ""
              : "Escreva aqui ou use o microfone para ditar sua história...\n\nEx: Meu nome é João, sou ceramista há 30 anos. Aprendi com minha avó a trabalhar com o barro do cerrado..."
          }
          className={`w-full px-4 py-3 rounded-2xl border-2 bg-white text-sm text-forest-green
            placeholder-forest-green/25 focus:outline-none transition-colors resize-none leading-relaxed
            ${gravando
              ? "border-red-400 pt-9"
              : "border-forest-green/15 focus:border-old-gold"
            }`}
        />

        {/* Botão mic flutuante */}
        {suportaVoz ? (
          <button
            type="button"
            onClick={gravando ? pararGravacao : iniciarGravacao}
            aria-label={gravando ? "Parar gravação" : "Iniciar gravação de voz"}
            className={`absolute bottom-3 right-3 w-11 h-11 rounded-full shadow-md
              flex items-center justify-center transition-all duration-200
              ${gravando
                ? "bg-red-500 text-white scale-110"
                : "bg-old-gold/15 text-old-gold hover:bg-old-gold hover:text-forest-green hover:scale-105"
              }`}
          >
            {gravando ? <IconStop className="w-4 h-4" /> : <IconMic className="w-5 h-5" />}
          </button>
        ) : (
          <div className="absolute bottom-3 right-3 px-2 py-1 bg-gray-100 rounded-lg">
            <span className="text-[10px] text-gray-400">Voz indisponível</span>
          </div>
        )}
      </div>

      {/* Contador de caracteres */}
      <div className="flex items-center justify-between -mt-3 px-1">
        <span className="text-xs text-forest-green/35">
          {texto.length > 0 ? `${texto.split(/\s+/).filter(Boolean).length} palavras` : ""}
        </span>
        {texto.length > 0 && (
          <button
            type="button"
            onClick={() => setTexto("")}
            className="text-xs text-forest-green/35 hover:text-red-400 transition-colors"
          >
            Limpar
          </button>
        )}
      </div>

      {/* Botão gerar / spinner */}
      {processando ? (
        <div className="flex flex-col items-center gap-3 py-8 text-center" aria-busy="true" aria-live="polite">
          <div className="w-14 h-14 rounded-full border-4 border-old-gold/20 border-t-old-gold animate-spin" />
          <p className="font-serif text-base text-forest-green font-bold animate-pulse">
            Curando sua história...
          </p>
          <p className="text-xs text-forest-green/45">A IA está criando sua narrativa cultural</p>
        </div>
      ) : (
        <button
          onClick={handleGerar}
          disabled={!texto.trim()}
          className="w-full min-h-[52px] bg-forest-green text-silk-cream rounded-2xl font-bold text-base
            flex items-center justify-center gap-2
            hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-35"
        >
          <span className="text-lg">✦</span>
          Gerar Narrativa com IA
        </button>
      )}

      {/* Erro */}
      {erro && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
          {erro}
        </p>
      )}

      {/* Resultado da narrativa */}
      {narrativa && !processando && (
        <div className="flex flex-col gap-3">
          {salvo && (
            <div role="alert" aria-live="polite"
              className="flex items-center gap-2 bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-xl text-sm font-semibold">
              <IconCheck className="w-4 h-4 text-green-600 shrink-0" />
              Narrativa salva no perfil público!
            </div>
          )}

          <div className="bg-forest-green rounded-2xl p-5 flex flex-col gap-3">
            <p className="text-[10px] font-bold text-old-gold uppercase tracking-widest">
              Narrativa Cultural Gerada
            </p>
            <p className="text-sm text-silk-cream/90 leading-relaxed whitespace-pre-wrap">
              {narrativa}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={ouvirNarrativa}
              aria-label={lendo ? "Parar leitura" : "Ouvir narrativa"}
              className={`flex-1 min-h-[46px] rounded-2xl font-semibold text-sm
                flex items-center justify-center gap-2 transition-colors border-2 ${
                lendo
                  ? "bg-old-gold text-forest-green border-old-gold"
                  : "border-old-gold/50 text-old-gold hover:bg-old-gold hover:text-forest-green hover:border-old-gold"
              }`}
            >
              {lendo ? <><IconStop /> Parar</> : <><IconSpeaker /> Ouvir</>}
            </button>

            <button
              onClick={handleSalvar}
              disabled={salvando}
              className="flex-1 min-h-[46px] bg-forest-green text-silk-cream rounded-2xl font-bold text-sm
                flex items-center justify-center gap-2
                hover:bg-old-gold hover:text-forest-green transition-colors disabled:opacity-50"
            >
              {salvando ? "Salvando..." : <><IconCheck /> Salvar no Perfil</>}
            </button>
          </div>

          <button
            onClick={() => { setNarrativa(""); setTexto(""); }}
            className="text-xs text-forest-green/40 hover:text-forest-green transition-colors text-center underline underline-offset-2"
          >
            Recomeçar com novo texto
          </button>
        </div>
      )}
    </div>
  );
}
