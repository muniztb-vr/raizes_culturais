package br.edu.raizesculturais.controller;

import br.edu.raizesculturais.dto.NotificacaoDTO;
import br.edu.raizesculturais.service.NotificacaoService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class NotificacaoController {

    private final NotificacaoService service;

    @GetMapping("/api/produtores/{produtorId}/notificacoes")
    public List<NotificacaoDTO> listar(@PathVariable Long produtorId) {
        return service.listar(produtorId);
    }

    @GetMapping("/api/produtores/{produtorId}/notificacoes/nao-lidas")
    public Map<String, Long> naoLidas(@PathVariable Long produtorId) {
        return Map.of("total", service.contarNaoLidas(produtorId));
    }

    @PatchMapping("/api/notificacoes/{id}/lida")
    public NotificacaoDTO marcarLida(@PathVariable Long id) {
        return service.marcarLida(id);
    }

    @PostMapping("/api/produtores/{produtorId}/notificacoes/marcar-todas-lidas")
    public void marcarTodasLidas(@PathVariable Long produtorId) {
        service.marcarTodasLidas(produtorId);
    }
}
