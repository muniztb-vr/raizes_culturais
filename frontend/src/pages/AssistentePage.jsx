import AIStoryAssistant from "../components/AIStoryAssistant";

export default function AssistentePage() {
  return (
    <main className="min-h-screen bg-silk-cream pb-44 md:pb-6">
      {/* O container já centraliza o conteúdo na tela larga */}
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10">
        
        {/* Adicionei 'text-center' para o texto e 'flex flex-col items-center' para garantir o alinhamento dos blocos filhos */}
        <header className="mb-10 text-center flex flex-col items-center">
          <h1 className="text-3xl font-serif text-forest-green">
            Assistente de Narrativa
          </h1>
          
          {/* Adicionei 'mx-auto' aqui. Como o <p> tem um 'max-w-xl', 
              ele precisa de margens automáticas laterais para centralizar o bloco. */}
          <p className="mt-2 text-base font-sans text-forest-green/60 leading-relaxed max-w-xl mx-auto">
            Conte sua história com suas próprias palavras. Nossa inteligência
            artificial cria uma narrativa cultural única sobre você e seu ofício.
          </p>
        </header>

        {/* Se quiser que o componente do assistente também fique centralizado caso ele tenha largura fixa */}
        <div className="flex justify-center">
            <AIStoryAssistant />
        </div>
      </div>
    </main>
  );
}
