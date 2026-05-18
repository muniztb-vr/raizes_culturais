import { useState } from "react";
import { narrativaService } from "../services/narrativaService";

const CAMPO_BASE =
  "w-full px-4 py-3 rounded-xl border-2 border-forest-green/20 bg-white " +
  "text-base font-sans text-forest-green placeholder-forest-green/40 " +
  "focus:outline-none focus:border-old-gold transition-colors";

export default function AIStoryAssistant() {
  const [form, setForm] = useState({ nome: "", localidade: "", bio: "" });
  const [narrativa, setNarrativa] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [copiado, setCopiado] = useState(false);

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setCarregando(true);
    setErro(null);
    setNarrativa(null);
    try {
      const payload = {
        id: null,
        nome: form.nome.trim(),
        localidade: form.localidade.trim() || null,
        bio: form.bio.trim() || null,
        contato: null,
        fotoUrl: null,
      };
      const data = await narrativaService.gerar(payload);
      setNarrativa(data.narrativa);
    } catch {
      setErro(
        "Não foi possível gerar a narrativa. Verifique sua conexão e tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function handleCopiar() {
    await navigator.clipboard.writeText(narrativa);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2500);
  }

  const podeEnviar = form.nome.trim().length > 0 && !carregando;

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-8">

      {/* Formulário */}
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">

        {/* Nome */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="nome" className="text-sm font-semibold text-forest-green">
            Seu nome <span className="text-old-gold" aria-label="campo obrigatório">*</span>
          </label>
          <input
            id="nome"
            name="nome"
            type="text"
            required
            autoComplete="name"
            placeholder="Ex.: Maria das Dores Silva"
            value={form.nome}
            onChange={handleChange}
            className={`${CAMPO_BASE} min-h-[48px]`}
          />
        </div>

        {/* Localidade */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="localidade" className="text-sm font-semibold text-forest-green">
            Onde você vive ou atua?
          </label>
          <input
            id="localidade"
            name="localidade"
            type="text"
            placeholder="Ex.: Vale do Jequitinhonha, MG"
            value={form.localidade}
            onChange={handleChange}
            className={`${CAMPO_BASE} min-h-[48px]`}
          />
        </div>

        {/* Bio / Palavras-chave */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="bio" className="text-sm font-semibold text-forest-green">
            Palavras-chave ou resumo da sua história
          </label>
          <p id="bio-desc" className="text-sm text-forest-green/60 leading-relaxed">
            Escreva livremente: seu ofício, tradições da família, festas que participa, materiais que usa...
          </p>
          <textarea
            id="bio"
            name="bio"
            rows={5}
            aria-describedby="bio-desc"
            placeholder="Ex.: ceramista, 40 anos de ofício, tradição da avó, argila do cerrado, festas juninas, bonecas de barro..."
            value={form.bio}
            onChange={handleChange}
            className={`${CAMPO_BASE} resize-none`}
          />
        </div>

        {/* CTA — botão grande, texto descritivo */}
        <button
          type="submit"
          disabled={!podeEnviar}
          aria-busy={carregando}
          className="w-full min-h-[56px] py-4 px-6 rounded-xl text-lg font-semibold
            transition-all duration-200
            bg-forest-green text-silk-cream
            hover:bg-old-gold hover:text-forest-green
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-old-gold
            disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {carregando ? "✦ Gerando sua história..." : "✦ Gerar Minha História"}
        </button>
      </form>

      {/* Mensagem de erro */}
      {erro && (
        <p role="alert" className="text-sm text-red-700 bg-red-50 p-4 rounded-xl border border-red-200">
          {erro}
        </p>
      )}

      {/* Resultado da IA */}
      {narrativa && (
        <section aria-label="Narrativa gerada" className="p-6 bg-forest-green rounded-2xl">
          <div className="flex items-center justify-between mb-4 gap-4">
            <h3 className="font-serif text-xl text-old-gold">Sua Narrativa Cultural</h3>
            <button
              onClick={handleCopiar}
              className="shrink-0 text-sm font-medium px-4 py-2 rounded-lg
                bg-old-gold/20 text-old-gold
                hover:bg-old-gold hover:text-forest-green transition-colors"
            >
              {copiado ? "✓ Copiado!" : "Copiar texto"}
            </button>
          </div>
          <p className="text-base font-sans text-silk-cream/90 leading-relaxed italic">
            {narrativa}
          </p>
        </section>
      )}
    </div>
  );
}
