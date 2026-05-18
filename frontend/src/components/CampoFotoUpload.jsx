import { useRef } from "react";

async function comprimirImagem(file, maxWidth = 900) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.getContext("2d").drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = objectUrl;
  });
}

export default function CampoFotoUpload({ label, value, onChange, altura = "h-36" }) {
  const inputRef = useRef(null);

  async function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;

    const maxMB = 10;
    if (file.size > maxMB * 1024 * 1024) {
      alert(`A imagem deve ter no máximo ${maxMB}MB.`);
      return;
    }

    try {
      const base64 = await comprimirImagem(file);
      onChange(base64);
    } catch {
      alert("Não foi possível processar a imagem. Tente outro arquivo.");
    }

    e.target.value = "";
  }

  function handleRemover() {
    onChange("");
  }

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-forest-green">{label}</label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFile}
      />

      {value ? (
        <div className={`relative rounded-2xl overflow-hidden border-2 border-forest-green/15 ${altura}`}>
          <img src={value} alt={label} className="w-full h-full object-cover" />

          <div className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-colors flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current.click()}
              className="px-3 py-1.5 bg-white text-forest-green rounded-lg text-xs font-bold shadow"
            >
              Trocar foto
            </button>
            <button
              type="button"
              onClick={handleRemover}
              className="px-3 py-1.5 bg-red-500 text-white rounded-lg text-xs font-bold shadow"
            >
              Remover
            </button>
          </div>

          {/* Botão sempre visível no mobile */}
          <button
            type="button"
            onClick={() => inputRef.current.click()}
            className="absolute bottom-2 right-2 px-3 py-1.5 bg-white/90 text-forest-green rounded-lg text-xs font-bold shadow md:hidden"
          >
            Trocar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          className={`w-full ${altura} border-2 border-dashed border-forest-green/20 rounded-2xl
            flex flex-col items-center justify-center gap-2 bg-white
            hover:border-old-gold hover:bg-old-gold/5 active:bg-old-gold/10 transition-colors`}
        >
          <span className="text-4xl">📷</span>
          <span className="text-sm font-semibold text-forest-green/60">Adicionar foto</span>
          <span className="text-xs text-forest-green/35">Do computador ou celular · JPG / PNG</span>
        </button>
      )}
    </div>
  );
}
