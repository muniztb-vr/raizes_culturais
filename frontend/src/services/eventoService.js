import api from "./api";

export const eventoService = {
  listarAtivos: () => api.get("/eventos").then((r) => r.data),
  listarTodos:  () => api.get("/gestor/eventos").then((r) => r.data),
  criar:        (dto) => api.post("/gestor/eventos", dto).then((r) => r.data),
  deletar:      (id)  => api.delete(`/gestor/eventos/${id}`),
};
