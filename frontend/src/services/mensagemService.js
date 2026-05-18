import api from "./api";

export const mensagemService = {
  enviar: (produtorId, dados) =>
    api.post(`/produtores/${produtorId}/mensagens`, dados).then((r) => r.data),
  enviarPeloGestor: (produtorId, conteudo) =>
    api.post("/gestor/mensagens", { produtorId, conteudo }).then((r) => r.data),
  listar: (produtorId) =>
    api.get(`/produtores/${produtorId}/mensagens`).then((r) => r.data),
  marcarLida: (id) =>
    api.patch(`/mensagens/${id}/lida`).then((r) => r.data),
  naoLidas: (produtorId) =>
    api.get(`/produtores/${produtorId}/mensagens/nao-lidas`).then((r) => r.data.total),
};
