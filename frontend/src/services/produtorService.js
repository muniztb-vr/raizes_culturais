import api from "./api";

const BASE = "/produtores";

export const produtorService = {
  listar:          ()        => api.get(BASE).then(r => r.data),
  buscar:          (id)      => api.get(`${BASE}/${id}`).then(r => r.data),
  criar:           (dados)   => api.post(BASE, dados).then(r => r.data),
  atualizar:       (id, d)   => api.put(`${BASE}/${id}`, d).then(r => r.data),
  deletar:         (id)      => api.delete(`${BASE}/${id}`),
};
