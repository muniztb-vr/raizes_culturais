import api from "./api";

export const participacaoService = {
  listarPorProdutor: (produtorId) =>
    api.get(`/produtores/${produtorId}/participacoes`).then((r) => r.data),
  confirmar: (produtorId, eventoId, nomeEvento) =>
    api.post(`/produtores/${produtorId}/participacoes`, { eventoId, nomeEvento }).then((r) => r.data),
  cancelar: (produtorId, eventoId) =>
    api.delete(`/produtores/${produtorId}/participacoes/${eventoId}`),
  listarTodas: () =>
    api.get("/gestor/participacoes").then((r) => r.data),
  confirmarVisitante: (eventoId, dados) =>
    api.post(`/eventos/${eventoId}/visitantes`, dados).then((r) => r.data),
};
