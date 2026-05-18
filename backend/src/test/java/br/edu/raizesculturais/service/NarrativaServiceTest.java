package br.edu.raizesculturais.service;

import br.edu.raizesculturais.dto.NarrativaResponseDTO;
import br.edu.raizesculturais.dto.TranscricaoDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.*;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

/**
 * Testa NarrativaService via MockRestServiceServer —
 * intercepta chamadas HTTP sem depender de bytecode manipulation,
 * compatível com Java 25.
 */
@DisplayName("NarrativaService — integração com Gemini API (mock HTTP)")
class NarrativaServiceTest {

    private NarrativaService service;
    private MockRestServiceServer mockServer;

    @BeforeEach
    void setup() {
        RestTemplate restTemplate = new RestTemplate();
        mockServer = MockRestServiceServer.createServer(restTemplate);

        service = new NarrativaService(restTemplate);
        ReflectionTestUtils.setField(service, "geminiApiKey", "test-key-12345");
        ReflectionTestUtils.setField(service, "geminiModel", "gemini-2.5-flash");
    }

    // ── T01: Geração bem-sucedida ──────────────────────────────────────────────

    @Test
    @DisplayName("T01 — Deve gerar narrativa quando Gemini retorna 200 com texto válido")
    void deveGerarNarrativaComSucesso() {
        String body = """
            {"candidates":[{"content":{"parts":[{"text":"Narrativa gerada."}]}}]}
            """;
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("generateContent")))
                  .andExpect(method(HttpMethod.POST))
                  .andRespond(withSuccess(body, MediaType.APPLICATION_JSON));

        NarrativaResponseDTO result = service.gerarNarrativa(new TranscricaoDTO("Faço queijo há 20 anos."));

        assertThat(result.narrativa()).isEqualTo("Narrativa gerada.");
        mockServer.verify();
    }

    // ── T02: Rate limit 429 ────────────────────────────────────────────────────

    @Test
    @DisplayName("T02 — Deve exibir mensagem amigável (503) quando Gemini retorna 429")
    void deveRetornarMensagemAmigavelQuando429() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("generateContent")))
                  .andRespond(withTooManyRequests());

        ResponseStatusException ex = catchThrowableOfType(
            () -> service.gerarNarrativa(new TranscricaoDTO("relato")),
            ResponseStatusException.class
        );

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(ex.getReason()).contains("processando muitas histórias");
    }

    // ── T03: Modelo não encontrado 404 ────────────────────────────────────────

    @Test
    @DisplayName("T03 — Deve orientar troca de modelo quando Gemini retorna 404")
    void deveInformarModeloNaoEncontradoQuando404() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("generateContent")))
                  .andRespond(withStatus(HttpStatus.NOT_FOUND));

        ResponseStatusException ex = catchThrowableOfType(
            () -> service.gerarNarrativa(new TranscricaoDTO("relato")),
            ResponseStatusException.class
        );

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.SERVICE_UNAVAILABLE);
        assertThat(ex.getReason()).containsIgnoringCase("não encontrado");
    }

    // ── T04: Resposta vazia da IA ─────────────────────────────────────────────

    @Test
    @DisplayName("T04 — Deve lançar 500 quando Gemini retorna candidatos com texto vazio")
    void deveLancarErroQuandoRespostaVazia() {
        String emptyBody = """
            {"candidates":[{"content":{"parts":[{"text":""}]}}]}
            """;
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("generateContent")))
                  .andRespond(withSuccess(emptyBody, MediaType.APPLICATION_JSON));

        ResponseStatusException ex = catchThrowableOfType(
            () -> service.gerarNarrativa(new TranscricaoDTO("relato")),
            ResponseStatusException.class
        );

        assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.INTERNAL_SERVER_ERROR);
    }

    // ── T05: Chave API inválida 403 ───────────────────────────────────────────

    @Test
    @DisplayName("T05 — Deve informar chave inválida quando Gemini retorna 403")
    void deveInformarChaveInvalidaQuando403() {
        mockServer.expect(requestTo(org.hamcrest.Matchers.containsString("generateContent")))
                  .andRespond(withStatus(HttpStatus.FORBIDDEN));

        ResponseStatusException ex = catchThrowableOfType(
            () -> service.gerarNarrativa(new TranscricaoDTO("relato")),
            ResponseStatusException.class
        );

        assertThat(ex.getReason()).containsIgnoringCase("API Key");
    }
}
