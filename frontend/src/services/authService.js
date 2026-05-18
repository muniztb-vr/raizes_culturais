import api from "./api";

export const authService = {
  cadastrar: (dados) => api.post("/auth/cadastro", dados).then((r) => r.data),
  login: (dados) => api.post("/auth/login", dados).then((r) => r.data),
  atualizarNarrativa: (id, narrativa) =>
    api.put(`/produtores/${id}/narrativa`, { narrativa }).then((r) => r.data),
  atualizarConfiguracoes: (id, dados) =>
    api.put(`/produtores/${id}/configuracoes`, dados).then((r) => r.data),
  cadastrarPeloGestor: (dados) =>
    api.post("/produtores/gestor/cadastrar", dados).then((r) => r.data),
};
