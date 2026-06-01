import api from "./api";

export const produtoService = {
  listarPorProdutor: (produtorId) =>
    api.get(`/produtores/${produtorId}/produtos`).then((r) => r.data),
  contagemPorProdutor: () =>
    api.get("/produtos/contagem").then((r) => r.data),
  criar: (produto) => api.post("/produtos", produto).then((r) => r.data),
  atualizar: (id, produto) => api.put(`/produtos/${id}`, produto).then((r) => r.data),
  deletar: (id) => api.delete(`/produtos/${id}`),
};

export const CATEGORIAS_PRODUTO = [
  { value: "CAFES",                   label: "Cafés",                         icon: "☕", cor: "#78350F" },
  { value: "AGROINDUSTRIA",           label: "Agroindústria",                 icon: "🌾", cor: "#15803D" },
  { value: "HORTIFRUTI_ORGANICO",     label: "Hortifrúti Orgânico",           icon: "🥬", cor: "#16A34A" },
  { value: "HORTIFRUTI_AGROECOLOGICO",label: "Hortifrúti Agroecológicos",     icon: "🌿", cor: "#166534" },
  { value: "ARTESANATO",              label: "Artesanatos",                   icon: "🏺", cor: "#7C3AED" },
  { value: "LICORES_CACHACAS",        label: "Licores e Cachaças Artesanais", icon: "🥃", cor: "#92400E" },
  { value: "COSMETICOS",              label: "Cosméticos Naturais",           icon: "🌸", cor: "#DB2777" },
];

export const FORM_PRODUTO_VAZIO = {
  nome: "", quantidade: 1, descricao: "", contato: "",
  categoria: "ARTESANATO", preco: "", fotoUrl: "",
};
