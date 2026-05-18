export const EVENTOS = [
  {
    id: 1,
    nome: "Feira das Tradições",
    tipo: "Feira",
    dataInicio: "2026-06-15",
    dataFim: "2026-06-18",
    local: "Praça Tiradentes, Centro Histórico",
    cidade: "Ouro Preto",
    estado: "MG",
    visitantesEsperados: 12000,
    vagasExpositor: 80,
    vagasVisitante: 500,
    descricao:
      "A maior feira de cultura e artesanato de Minas Gerais. Reúne produtores rurais, ceramistas, bordadeiras e artesãos de toda a região. Com apresentações musicais, gastronomia típica e oficinas culturais.",
    entradaGratuita: true,
    imagem:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
    lat: -20.3856,
    lng: -43.5035,
  },
  {
    id: 2,
    nome: "Mercado de Arte Popular",
    tipo: "Feira",
    dataInicio: "2026-07-04",
    dataFim: "2026-07-06",
    local: "Mercado Modelo",
    cidade: "Salvador",
    estado: "BA",
    visitantesEsperados: 8500,
    vagasExpositor: 60,
    vagasVisitante: 400,
    descricao:
      "Celebração da arte popular baiana com artesanato em couro, rendas e produtos do sertão. Um encontro de culturas que valoriza o fazer manual e a tradição nordestina.",
    entradaGratuita: true,
    imagem:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80",
    lat: -12.9714,
    lng: -38.5014,
  },
  {
    id: 3,
    nome: "Festival de Cultura Caiçara",
    tipo: "Festival",
    dataInicio: "2026-07-20",
    dataFim: "2026-07-22",
    local: "Orla da Praia",
    cidade: "Paraty",
    estado: "RJ",
    visitantesEsperados: 5000,
    vagasExpositor: 40,
    vagasVisitante: 300,
    descricao:
      "Festival celebrando a cultura caiçara litorânea, com música ao vivo, dança e exposição de artesanato típico das comunidades pesqueiras.",
    entradaGratuita: false,
    imagem:
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=800&q=80",
    lat: -23.2178,
    lng: -44.7131,
  },
  {
    id: 4,
    nome: "Mostra de Artesanato do Nordeste",
    tipo: "Exposição",
    dataInicio: "2026-08-10",
    dataFim: "2026-08-15",
    local: "Centro de Convenções",
    cidade: "Fortaleza",
    estado: "CE",
    visitantesEsperados: 15000,
    vagasExpositor: 120,
    vagasVisitante: 800,
    descricao:
      "A maior mostra de artesanato do Nordeste brasileiro, reunindo artesãos dos nove estados com peças únicas de cerâmica, rendas, bordados e trançados.",
    entradaGratuita: true,
    imagem:
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
    lat: -3.7172,
    lng: -38.5433,
  },
  {
    id: 5,
    nome: "Encontro de Saberes Amazônicos",
    tipo: "Evento Cultural",
    dataInicio: "2026-09-05",
    dataFim: "2026-09-07",
    local: "Bosque da Ciência",
    cidade: "Manaus",
    estado: "AM",
    visitantesEsperados: 3000,
    vagasExpositor: 30,
    vagasVisitante: 200,
    descricao:
      "Encontro que celebra os saberes dos povos da floresta amazônica, com exposição de plantas medicinais, artesanato indígena e apresentações culturais.",
    entradaGratuita: true,
    imagem:
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    lat: -3.119,
    lng: -60.0217,
  },
];

export function proximoEvento() {
  const hoje = new Date();
  return (
    EVENTOS.find((e) => new Date(e.dataInicio + "T12:00:00") >= hoje) ||
    EVENTOS[0]
  );
}
