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
  esqueceuSenha: (email) =>
    api.post("/auth/forgot-password", { email }).then((r) => r.data),
  redefinirSenha: (token, novaSenha) =>
    api.post("/auth/reset-password", { token, novaSenha }).then((r) => r.data),
  alterarSenha: (id, senhaAtual, novaSenha) =>
    api.put(`/auth/produtores/${id}/senha`, { senhaAtual, novaSenha }).then((r) => r.data),
};
