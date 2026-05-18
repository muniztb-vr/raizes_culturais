import { CATEGORIAS_PRODUTO } from "../services/produtoService";

const CAT_FALLBACK = { label: "Produtor Rural", icon: "📦", cor: "#6B7280" };

function hash(id) {
  return Math.abs((Number(id) * 2654435761) | 0);
}

export function enrichProdutor(p) {
  const h = hash(p.id || 1);
  // Usa sempre o campo real do banco — sem derivação por bio
  const cat = CATEGORIAS_PRODUTO.find((c) => c.value === p.categoriaProd) || CAT_FALLBACK;
  const anosAtivo = p.anoInicio ? new Date().getFullYear() - p.anoInicio : 5 + (h % 35);
  return {
    ...p,
    catLabel: cat.label,
    catIcon: cat.icon,
    catColor: cat.cor,
    // Mantido para componentes que ainda lêem p.categoria
    categoria: cat.label,
    verificado: (h % 3) !== 0,
    avaliacao: Number((4.4 + (h % 7) / 15).toFixed(1)),
    totalAvaliacoes: 40 + (h % 180),
    totalProdutos: 8 + (h % 60),
    seguidores: 300 + (h % 2000),
    anosAtivo,
    desde: new Date().getFullYear() - anosAtivo,
  };
}

export function formatNumber(n) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function formatDateRange(inicio, fim) {
  const d1 = new Date(inicio + "T12:00:00");
  const d2 = new Date(fim + "T12:00:00");
  const month = d1.toLocaleDateString("pt-BR", { month: "long" });
  const year = d1.getFullYear();
  if (inicio === fim) return `${d1.getDate()} de ${month} de ${year}`;
  if (d1.getMonth() === d2.getMonth())
    return `${d1.getDate()} a ${d2.getDate()} de ${month} de ${year}`;
  const m2 = d2.toLocaleDateString("pt-BR", { month: "long" });
  return `${d1.getDate()} de ${month} a ${d2.getDate()} de ${m2} de ${year}`;
}

export function formatEventShort(evento) {
  const d = new Date(evento.dataInicio + "T12:00:00");
  const month = d.toLocaleDateString("pt-BR", { month: "long" });
  const cap = month.charAt(0).toUpperCase() + month.slice(1);
  return `${d.getDate()} de ${cap} · ${evento.cidade}, ${evento.estado}`;
}

// Categorias principais exibidas por padrão nos filtros
export const CATS_PRINCIPAIS = ["CAFE", "AGROINDUSTRIA", "LATICINIOS", "ARTESANATO"];
