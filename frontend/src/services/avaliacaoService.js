import api from "./api";

export const avaliacaoService = {
  listarPorProdutor: (produtorId) =>
    api.get(`/produtores/${produtorId}/avaliacoes`).then((r) => r.data),
  resumo: (produtorId) =>
    api.get(`/produtores/${produtorId}/avaliacoes/resumo`).then((r) => r.data),
  criar: (avaliacao) =>
    api.post("/avaliacoes", avaliacao).then((r) => r.data),
};
