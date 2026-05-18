// ── Categoria 1: Autenticação e RBAC ─────────────────────────────────────────

describe("Autenticação — Produtor e Gestor", () => {

  beforeEach(() => cy.logout());

  // ── T-A01: Cadastro com campos obrigatórios ───────────────────────────────
  it("T-A01 — Cadastro exige Nome, E-mail, Senha, CPF e Categoria", () => {
    cy.visit("/cadastro");
    cy.get('button[type="submit"]').click();

    // HTML5 validation ou mensagem de erro deve aparecer
    cy.get("input[name=nome]:invalid, input[name=nome][required]").should("exist");
  });

  // ── T-A02: Cadastro completo cria conta e redireciona ────────────────────
  it("T-A02 — Cadastro completo redireciona para /dashboard", () => {
    const email = `test_${Date.now()}@raizes.com`;
    cy.visit("/cadastro");

    cy.get("input[name=nome]").type("Produtor E2E");
    cy.get("input[name=cpf]").type("123.456.789-09");
    cy.get("input[name=email]").type(email);
    cy.get("input[name=senha]").type("senha123");
    cy.get("input[name=municipio]").type("Ouro Preto");
    cy.get("input[name=localidade]").type("Minas Gerais");
    cy.get("select[name=categoriaProd]").select("CAFE");
    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 8000 }).should("include", "/dashboard");
    cy.contains("Minha História").should("be.visible");
  });

  // ── T-A03: Login com credenciais incorretas ───────────────────────────────
  it("T-A03 — Login com senha errada exibe erro sem quebrar a página", () => {
    cy.visit("/entrar");
    cy.get("input[name=email]").type("muniztb@gmail.com");
    cy.get("input[name=senha]").type("senha_errada_xpto");
    cy.get('button[type="submit"]').click();

    cy.get("[role=alert]", { timeout: 5000 }).should("contain", "E-mail ou senha");
    cy.url().should("include", "/entrar"); // Não navega
  });

  // ── T-A04: Produtor não acessa painel do gestor ──────────────────────────
  it("T-A04 — Produtor autenticado não acessa /gestor (redireciona para login do gestor)", () => {
    cy.cadastrarProdutor().then((produtor) => {
      cy.loginProdutor(produtor.email, "teste123");
      cy.visit("/gestor");
      cy.url({ timeout: 5000 }).should("include", "/gestor/login");
    });
  });

  // ── T-A05: Gestor não acessa /dashboard do produtor ─────────────────────
  it("T-A05 — Gestor logado não acessa /dashboard (redireciona para /entrar)", () => {
    cy.loginGestor();
    cy.visit("/dashboard");
    cy.url({ timeout: 5000 }).should("include", "/entrar");
  });

  // ── T-A06: Login do gestor com credenciais corretas ──────────────────────
  it("T-A06 — Login do gestor com credenciais corretas acessa /gestor", () => {
    cy.visit("/gestor/login");
    cy.get("input[name=email]").type(Cypress.env("gestorEmail"));
    cy.get("input[name=senha]").type(Cypress.env("gestorSenha"));
    cy.get('button[type="submit"]').click();

    cy.url({ timeout: 8000 }).should("include", "/gestor");
    cy.contains("Dashboard do Gestor").should("be.visible");
  });
});
