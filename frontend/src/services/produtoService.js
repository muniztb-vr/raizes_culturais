import api from "./api";

export const produtoService = {
  listarPorProdutor: (produtorId) =>
    api.get(`/produtores/${produtorId}/produtos`).then((r) => r.data),
  criar: (produto) => api.post("/produtos", produto).then((r) => r.data),
  atualizar: (id, produto) => api.put(`/produtos/${id}`, produto).then((r) => r.data),
  deletar: (id) => api.delete(`/produtos/${id}`),
};

export const CATEGORIAS_PRODUTO = [
  { value: "CAFE",          label: "Café",                   icon: "☕", cor: "#78350F" },
  { value: "MEL",           label: "Mel & Apicultura",       icon: "🍯", cor: "#D97706" },
  { value: "CACHACA",       label: "Cachaça Artesanal",      icon: "🥃", cor: "#92400E" },
  { value: "ARTESANATO",    label: "Artesanato",             icon: "🏺", cor: "#7C3AED" },
  { value: "LATICINIOS",    label: "Laticínios & Queijos",   icon: "🧀", cor: "#B45309" },
  { value: "AGROINDUSTRIA", label: "Agroindústria",          icon: "🌾", cor: "#15803D" },
  { value: "PESCA",         label: "Pesca Artesanal",        icon: "🐟", cor: "#0369A1" },
  { value: "HORTIFRUTI",    label: "Hortifruti & Orgânicos", icon: "🥬", cor: "#16A34A" },
  { value: "COSMETICOS",    label: "Cosméticos Naturais",    icon: "🌸", cor: "#DB2777" },
  { value: "DOCES",         label: "Doces & Conservas",      icon: "🍬", cor: "#EA580C" },
];

export const FORM_PRODUTO_VAZIO = {
  nome: "", quantidade: 1, descricao: "", contato: "",
  categoria: "ARTESANATO", preco: "", fotoUrl: "",
};
