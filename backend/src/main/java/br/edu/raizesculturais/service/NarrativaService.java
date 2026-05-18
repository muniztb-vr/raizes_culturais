package br.edu.raizesculturais.service;

import br.edu.raizesculturais.dto.NarrativaResponseDTO;
import br.edu.raizesculturais.dto.TranscricaoDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class NarrativaService {

    // v1beta: suporta system_instruction (separação de papel da IA e mensagem do usuário)
    // v1 (estável) não suporta system_instruction — field "Unknown name"
    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}";

    // System prompt: instrui a IA sobre seu papel (separado do relato do usuário)
    private static final String SYSTEM_PROMPT =
            """
            Você é um curador cultural especializado em patrimônio imaterial brasileiro.
            Sua missão é transformar o relato bruto de um produtor rural em um texto
            profissional para o perfil público da plataforma Raízes Culturais.

            Regras obrigatórias:
            - Escreva em português brasileiro caloroso e acessível
            - Estruture em: Título curto e impactante (1ª linha), seguido de 3 parágrafos
            - Parágrafo 1: apresentação do produtor e sua tradição
            - Parágrafo 2: o processo, a técnica ou o produto
            - Parágrafo 3: encerramento inspirador conectando ao território e à comunidade
            - Preserve expressões e referências regionais do relato original
            - Corrija gramática sem apagar a voz do produtor
            - Entre 150 e 250 palavras no total
            - Não use asteriscos, markdown, negrito ou formatação especial
            - Comece diretamente pelo título, sem frases como "Aqui está" ou "Claro!"
            """;

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    @Value("${gemini.model:gemini-2.0-flash}")
    private String geminiModel;

    private final RestTemplate restTemplate;

    @SuppressWarnings("unchecked")
    public NarrativaResponseDTO gerarNarrativa(TranscricaoDTO dto) {

        // System instruction separado — não mistura papel da IA com o relato do usuário
        Map<String, Object> systemInstruction = Map.of(
                "parts", List.of(Map.of("text", SYSTEM_PROMPT))
        );

        // Mensagem do usuário: apenas o relato bruto
        Map<String, Object> requestBody = Map.of(
                "system_instruction", systemInstruction,
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", "Relato do produtor:\n\n" + dto.transcricao())
                        ))
                )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        System.out.printf("[Gemini] → POST v1/%s | apiKey=%s...%n",
                geminiModel,
                geminiApiKey.length() > 6 ? geminiApiKey.substring(0, 6) + "***" : "VAZIA");

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    GEMINI_URL,
                    HttpMethod.POST,
                    entity,
                    Map.class,
                    geminiModel,
                    geminiApiKey
            );

            System.out.printf("[Gemini] ← HTTP %d%n", response.getStatusCode().value());

            String narrativa = extrairTexto(response.getBody());

            if (narrativa == null || narrativa.isBlank()) {
                System.err.println("[Gemini] AVISO: resposta vazia. Body: " + response.getBody());
                throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "A IA retornou uma resposta vazia. Tente novamente.");
            }

            System.out.printf("[Gemini] Narrativa gerada com sucesso (%d chars)%n", narrativa.length());
            return new NarrativaResponseDTO(narrativa);

        } catch (HttpClientErrorException e) {
            int status = e.getStatusCode().value();
            System.err.printf("[Gemini] ERRO cliente HTTP %d: %s%n", status, e.getResponseBodyAsString());
            String detalhe = switch (status) {
                case 400 -> "Parâmetros inválidos. Verifique a API Key.";
                case 403 -> "Acesso negado — API Key inválida ou sem permissão.";
                case 404 -> String.format(
                        "Modelo '%s' não encontrado no plano atual. " +
                        "Altere gemini.model em application.properties para gemini-2.0-flash e reinicie.", geminiModel);
                case 429 -> "O assistente está processando muitas histórias agora. Aguarde um minuto e tente novamente.";
                default  -> "Erro da API Gemini (" + status + "): " + e.getMessage();
            };
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, detalhe);

        } catch (HttpServerErrorException e) {
            System.err.printf("[Gemini] ERRO servidor HTTP %d: %s%n",
                    e.getStatusCode().value(), e.getResponseBodyAsString());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Servidor da IA fora do ar. Tente novamente em instantes.");

        } catch (ResponseStatusException e) {
            throw e;

        } catch (Exception e) {
            System.err.printf("[Gemini] ERRO inesperado %s: %s%n", e.getClass().getSimpleName(), e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Serviço de IA indisponível: " + e.getMessage());
        }
    }

    @SuppressWarnings("unchecked")
    private String extrairTexto(Map<String, Object> body) {
        try {
            var candidates = (List<Map<String, Object>>) body.get("candidates");
            if (candidates == null || candidates.isEmpty()) {
                System.err.println("[Gemini] 'candidates' ausente no body: " + body);
                return null;
            }
            var content = (Map<String, Object>) candidates.get(0).get("content");
            var parts   = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            System.err.println("[Gemini] Falha ao parsear resposta: " + body);
            return null;
        }
    }
}
