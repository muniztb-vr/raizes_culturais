package br.edu.raizesculturais.controller;

import br.edu.raizesculturais.dto.ParticipacaoDTO;
import br.edu.raizesculturais.service.ParticipacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ParticipacaoController {

    private final ParticipacaoService service;

    @GetMapping("/api/produtores/{produtorId}/participacoes")
    public List<ParticipacaoDTO> listarPorProdutor(@PathVariable Long produtorId) {
        return service.listarPorProdutor(produtorId);
    }

    @GetMapping("/api/gestor/participacoes")
    public List<ParticipacaoDTO> listarTodas() {
        return service.listarTodas();
    }

    @PostMapping("/api/produtores/{produtorId}/participacoes")
    @ResponseStatus(HttpStatus.CREATED)
    public ParticipacaoDTO confirmar(@PathVariable Long produtorId,
                                     @RequestBody Map<String, Object> body) {
        Long eventoId = Long.valueOf(body.get("eventoId").toString());
        String nomeEvento = body.getOrDefault("nomeEvento", "").toString();
        return service.confirmar(produtorId, eventoId, nomeEvento);
    }

    // Endpoint público — visitantes não precisam de login
    @PostMapping("/api/eventos/{eventoId}/visitantes")
    @ResponseStatus(HttpStatus.CREATED)
    public ParticipacaoDTO confirmarVisitante(@PathVariable Long eventoId,
                                              @RequestBody Map<String, Object> body) {
        String nomeEvento        = body.getOrDefault("nomeEvento", "").toString();
        String nomeVisitante     = body.getOrDefault("nomeVisitante", "").toString();
        String emailVisitante    = body.getOrDefault("emailVisitante", "").toString();
        String whatsappVisitante = body.getOrDefault("whatsappVisitante", "").toString();
        int quantidadePessoas    = Integer.parseInt(body.getOrDefault("quantidadePessoas", "1").toString());
        return service.confirmarVisitante(eventoId, nomeEvento, nomeVisitante,
                emailVisitante, whatsappVisitante, quantidadePessoas);
    }

    @DeleteMapping("/api/produtores/{produtorId}/participacoes/{eventoId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void cancelar(@PathVariable Long produtorId, @PathVariable Long eventoId) {
        service.cancelar(produtorId, eventoId);
    }
}
