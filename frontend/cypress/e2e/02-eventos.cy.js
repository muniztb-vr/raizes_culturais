// ── Categoria 4: Eventos, Vagas e Expiração ──────────────────────────────────

const API = Cypress.env("apiUrl");

describe("Eventos — filtros, vagas e expiração", () => {

  // ── T-E01: Filtro por localidade exibe apenas eventos da cidade ──────────
  it("T-E01 — Filtro por localidade exibe somente eventos da cidade selecionada", () => {
    cy.visit("/eventos");
    cy.contains("button", /Ouro Preto|Salvador|Manaus|Paraty|Fortaleza/, { timeout: 6000 })
      .first().as("filtro");

    cy.get("@filtro").invoke("text").then((cidade) => {
      cy.get("@filtro").click();
      // Todos os cards visíveis devem conter a cidade selecionada
      cy.get("article").each(($card) => {
        cy.wrap($card).should("contain.text", cidade.trim().replace(/📍/g, "").trim().split(",")[0]);
      });
    });
  });

  // ── T-E02: Evento expirado não aparece na página pública ─────────────────
  it("T-E02 — Evento com dataFim no passado não aparece na página de eventos", () => {
    // Cria evento expirado via API
    const expirado = {
      nome: "Evento Expirado E2E",
      tipo: "Feira",
      dataInicio: "2020-01-01",
      dataFim: "2020-01-03",
      cidade: "Recife",
      estado: "PE",
      vagasExpositor: 10,
      vagasVisitante: 100,
      entradaGratuita: true,
      descricao: "Evento do passado",
      local: "Centro",
      horario: "09:00 - 18:00",
    };

    cy.request("POST", `${API}/gestor/eventos`, expirado).then(({ body }) => {
      cy.visit("/eventos");
      cy.contains("Evento Expirado E2E").should("not.exist");

      // Mas deve aparecer no gestor
      cy.loginGestor();
      cy.visit("/gestor");
      cy.contains("button", /Eventos/).click();
      cy.contains("Evento Expirado E2E").should("exist");
      cy.contains("Encerrado").should("exist");

      // Limpar
      cy.request("DELETE", `${API}/gestor/eventos/${body.id}`);
    });
  });

  // ── T-E03: Vagas de expositor e visitante exibidas no card ───────────────
  it("T-E03 — Card de evento exibe vagas de expositor e visitante", () => {
    cy.visit("/eventos");
    cy.get("article").first().within(() => {
      cy.contains(/exp\.|Esgotado/).should("exist");
      cy.contains(/vis\.|Esgotado/).should("exist");
    });
  });

  // ── T-E04: Visitante confirma participação e vagas são atualizadas ───────
  it("T-E04 — Visitante confirma participação e badge de vagas decrementa", () => {
    cy.visit("/eventos");
    cy.get("article").first().as("card");

    // Captura vagas antes
    cy.get("@card").invoke("text").then((antes) => {
      const match = antes.match(/(\d+)\/(\d+)\s*vis/);
      if (!match) return; // Skip se não houver vagas visíveis
      const visAntes = parseInt(match[1]);

      cy.get("@card").click();
      cy.contains("Confirmar Participação").click();
      cy.contains("Como Visitante").click();
      cy.get("input[name=nomeVisitante]").type("Visitante E2E");
      cy.get("input[name=emailVisitante]").type(`vis_e2e_${Date.now()}@test.com`);
      cy.get("input[name=quantidadePessoas]").clear().type("2");
      cy.contains("button", "Confirmar como Visitante").click();

      cy.contains("✅", { timeout: 6000 }).should("exist");
      cy.contains("Fechar").click();

      // Badge atualiza (pode precisar reload em implementação sem WebSocket)
      cy.get("@card").invoke("text").should((depois) => {
        const matchDepois = depois.match(/(\d+)\/(\d+)\s*vis/);
        if (matchDepois) {
          expect(parseInt(matchDepois[1])).to.be.lessThan(visAntes);
        }
      });
    });
  });

  // ── T-E05: Expositor sem login recebe prompt de autenticação ─────────────
  it("T-E05 — Expositor sem login recebe mensagem pedindo autenticação", () => {
    cy.logout();
    cy.visit("/eventos");
    cy.get("article").first().click();
    cy.contains("Confirmar Participação").click();
    // O modal expositor deve estar selecionado por padrão ou selecionável
    cy.contains("Como Expositor").click();
    cy.contains("button", /Verificar|Reservar Vaga/).click();

    cy.contains(/necessário estar logado|Entrar/, { timeout: 5000 }).should("be.visible");
    cy.contains("a, button", "Entrar").should("be.visible");
  });
});
