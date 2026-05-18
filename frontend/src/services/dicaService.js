import api from "./api";

export const dicaService = {
  listar: () =>
    api.get("/dicas").then((r) => r.data),
  criar: (dados) =>
    api.post("/gestor/dicas", dados).then((r) => r.data),
  deletar: (id) =>
    api.delete(`/gestor/dicas/${id}`),
};
