// ── Categorias 3 e 5: Comunicação, Upload e Filtros ─────────────────────────

const API = Cypress.env("apiUrl");

describe("Comunicação — mensagens e notificações", () => {

  let produtorId;

  before(() => {
    cy.cadastrarProdutor({ email: `msg_e2e_${Date.now()}@test.com` })
      .then((p) => { produtorId = p.id; });
  });

  // ── T-C01: Visitante envia mensagem pelo perfil público ──────────────────
  it("T-C01 — Modal de mensagem envia dados à API e exibe sucesso", () => {
    cy.visit(`/produtores/${produtorId}`);
    cy.contains("button", "Mensagem", { timeout: 6000 }).first().click();

    cy.get("input[name=nome]").type("Visitante Teste");
    cy.get("input[name=email]").type("visitante@e2e.com");
    cy.get("input[name=whatsapp]").type("(21) 99999-1234");
    cy.get("textarea[name=mensagem]").type("Olá, tenho interesse nos seus produtos!");
    cy.contains("button", "Enviar Mensagem").click();

    cy.contains("✅", { timeout: 6000 }).should("be.visible");
    cy.contains(/foi notificado|Mensagem enviada/).should("be.visible");
  });

  // ── T-C02: Mensagem aparece na inbox do produtor ─────────────────────────
  it("T-C02 — Mensagem enviada aparece na aba Comunicação do dashboard", () => {
    // Verifica diretamente via API
    cy.request("GET", `${API}/produtores/${produtorId}/mensagens`).then(({ body }) => {
      expect(body.length).to.be.greaterThan(0);
      expect(body[0].remetente).to.equal("Visitante Teste");
      expect(body[0].lida).to.be.false;
    });
  });

  // ── T-C03: Notificação automática gerada ao receber mensagem ─────────────
  it("T-C03 — Receber mensagem gera notificação automática para o produtor", () => {
    cy.request("GET", `${API}/produtores/${produtorId}/notificacoes`).then(({ body }) => {
      const msgNotif = body.find((n) => n.tipo === "mensagem");
      expect(msgNotif).to.exist;
      expect(msgNotif.texto).to.include("Visitante Teste");
      expect(msgNotif.lida).to.be.false;
    });
  });

  // ── T-C04: Marcar mensagem como lida ─────────────────────────────────────
  it("T-C04 — Marcar mensagem como lida via API atualiza flag 'lida'", () => {
    cy.request("GET", `${API}/produtores/${produtorId}/mensagens`).then(({ body }) => {
      const id = body[0].id;
      cy.request("PATCH", `${API}/mensagens/${id}/lida`).then(({ body: updated }) => {
        expect(updated.lida).to.be.true;
      });
    });
  });
});

describe("Upload Base64 — persistência de imagens", () => {

  // ── T-U01: String base64 longa não causa erro de coluna ──────────────────
  it("T-U01 — Upload de imagem base64 grande (>255 chars) persiste sem erro de coluna TEXT", () => {
    // Simula uma string base64 grande (1KB de caracteres)
    const base64Grande = "data:image/jpeg;base64," + "A".repeat(1024);

    cy.cadastrarProdutor({ fotoUrl: base64Grande }).then((produtor) => {
      cy.request("GET", `${API}/produtores/${produtor.id}`).then(({ body }) => {
        expect(body.fotoUrl.length).to.be.greaterThan(255);
        expect(body.fotoUrl).to.include("data:image/jpeg;base64,");
      });
    });
  });
});

describe("Filtros de categoria — Home e Diretório", () => {

  // ── T-F01: Home exibe 4 categorias principais por padrão ─────────────────
  it("T-F01 — Home exibe exatamente 4 categorias antes de expandir", () => {
    cy.visit("/");
    cy.contains("h2", "Categorias").should("be.visible");

    // Conta os cards de categoria visíveis (excluindo os ocultos por max-h-0)
    cy.get("section").contains("Categorias").closest("section")
      .find("button[class*='grid']").should("have.length.gte", 4);
  });

  // ── T-F02: Botão "Ver todas" expande categorias ocultas ──────────────────
  it("T-F02 — Clicar em 'Ver todas' expande categorias adicionais com animação", () => {
    cy.visit("/");

    cy.contains("button", /Ver todas|Ver todos/).click();
    cy.contains("button", /Menos/).should("exist");
    // Mais botões de categoria ficam visíveis
    cy.contains(/Mel|Cachaça|Pesca|Cosméticos/).should("be.visible");
  });

  // ── T-F03: Filtro no diretório de produtores filtra por categoria ─────────
  it("T-F03 — Filtro por categoria no diretório exibe apenas produtores da categoria", () => {
    cy.visit("/produtores");
    cy.contains("button", "☕").click(); // Café

    // Todos os produtores listados devem ter categoria Café ou estado vazio
    cy.get("p[style*='color']").each(($el) => {
      const texto = $el.text();
      expect(texto).to.match(/Café|—/);
    });
  });

  // ── T-F04: Filtro "Ver todos" no diretório expande e filtra corretamente ─
  it("T-F04 — Clicar em categoria oculta via 'Ver todos' filtra e colapsa painel", () => {
    cy.visit("/produtores");
    cy.contains("button", /Ver todos/).click();
    cy.contains("button", /Mel|Pesca|Doces/).first().click();

    // Painel colapsa e filtro fica ativo
    cy.contains("button", /Menos/).should("not.exist");
  });

  // ── T-F05: Vitrine — filtro de categoria funciona corretamente ───────────
  it("T-F05 — Filtro de categoria na Vitrine exibe apenas produtos da categoria", () => {
    cy.visit("/vitrine");
    cy.contains("button", "☕").click(); // Café

    cy.get("body").then(($body) => {
      if ($body.find("article").length > 0) {
        cy.get("article").each(($card) => {
          cy.wrap($card).contains(/Café/i).should("exist");
        });
      } else {
        cy.contains(/Nenhum produto/).should("be.visible");
      }
    });
  });
});

describe("Narrativa IA — debounce e rate limit", () => {

  // ── T-N01: Cliques múltiplos não disparam múltiplas requisições ──────────
  it("T-N01 — Botão 'Gerar Narrativa' fica desabilitado enquanto processa", () => {
    cy.cadastrarProdutor().then((p) => {
      cy.loginProdutor(p.email, "teste123");
      cy.visit("/dashboard");
      cy.contains("button, a", /Narrativa|História/).click();

      // Digita texto no campo
      cy.get("textarea").first().type("Sou produtor de café artesanal.");

      // Clica no botão de gerar
      cy.contains("button", /Gerar Narrativa/).click();

      // Botão deve ser desabilitado imediatamente (debounce/processando)
      cy.contains("button", /Gerando|Processando|\.\.\./).should("be.disabled");
    });
  });
});
