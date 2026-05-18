import api from "./api";

export const notificacaoService = {
  listar: (produtorId) =>
    api.get(`/produtores/${produtorId}/notificacoes`).then((r) => r.data),
  naoLidas: (produtorId) =>
    api.get(`/produtores/${produtorId}/notificacoes/nao-lidas`).then((r) => r.data.total),
  marcarLida: (id) =>
    api.patch(`/notificacoes/${id}/lida`).then((r) => r.data),
  marcarTodasLidas: (produtorId) =>
    api.post(`/produtores/${produtorId}/notificacoes/marcar-todas-lidas`),
};
