// ── Comandos customizados Raízes Culturais ────────────────────────────────────

const API = Cypress.env("apiUrl");

// Login de produtor via API (rápido, sem digitar na UI)
Cypress.Commands.add("loginProdutor", (email, senha) => {
  cy.request("POST", `${API}/auth/login`, { email, senha }).then(({ body }) => {
    localStorage.setItem("raizes_produtor", JSON.stringify(body));
  });
  cy.reload();
});

// Login de gestor via localStorage
Cypress.Commands.add("loginGestor", () => {
  localStorage.setItem("raizes_gestor", "true");
  cy.reload();
});

// Cria produtor de teste e retorna o objeto
Cypress.Commands.add("cadastrarProdutor", (overrides = {}) => {
  const dados = {
    nome: "Produtor Teste E2E",
    email: `e2e_${Date.now()}@test.com`,
    senha: "teste123",
    cpf: "000.000.000-00",
    municipio: "Ouro Preto",
    localidade: "Minas Gerais",
    endereco: "",
    contato: "(31) 99999-0000",
    anoInicio: 2010,
    categoriaProd: "CAFE",
    fotoUrl: "",
    fotoProducaoUrl: "",
    ...overrides,
  };
  return cy.request("POST", `${API}/auth/cadastro`, dados).then(({ body }) => body);
});

// Limpa dados de auth do localStorage
Cypress.Commands.add("logout", () => {
  localStorage.removeItem("raizes_produtor");
  localStorage.removeItem("raizes_gestor");
});
