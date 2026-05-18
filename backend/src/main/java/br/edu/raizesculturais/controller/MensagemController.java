package br.edu.raizesculturais.controller;

import br.edu.raizesculturais.dto.MensagemDTO;
import br.edu.raizesculturais.service.MensagemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class MensagemController {

    private final MensagemService service;

    // Público — visitante envia mensagem ao produtor
    @PostMapping("/api/produtores/{produtorId}/mensagens")
    @ResponseStatus(HttpStatus.CREATED)
    public MensagemDTO enviar(@PathVariable Long produtorId,
                              @RequestBody Map<String, Object> body) {
        return service.enviar(
                produtorId,
                body.getOrDefault("remetente", "Visitante").toString(),
                body.getOrDefault("emailRemetente", "").toString(),
                body.getOrDefault("whatsappRemetente", "").toString(),
                body.getOrDefault("conteudo", "").toString()
        );
    }

    // Gestor envia mensagem diretamente a um produtor
    @PostMapping("/api/gestor/mensagens")
    @ResponseStatus(HttpStatus.CREATED)
    public MensagemDTO enviarPeloGestor(@RequestBody Map<String, Object> body) {
        Long produtorId = Long.valueOf(body.get("produtorId").toString());
        return service.enviar(
                produtorId,
                "Gestor da Plataforma",
                "gestor@raizes.edu.br",
                "",
                body.getOrDefault("conteudo", "").toString()
        );
    }

    // Produtor lê sua inbox
    @GetMapping("/api/produtores/{produtorId}/mensagens")
    public List<MensagemDTO> listar(@PathVariable Long produtorId) {
        return service.listar(produtorId);
    }

    // Marcar mensagem como lida
    @PatchMapping("/api/mensagens/{id}/lida")
    public MensagemDTO marcarLida(@PathVariable Long id) {
        return service.marcarLida(id);
    }

    // Contagem de não lidas
    @GetMapping("/api/produtores/{produtorId}/mensagens/nao-lidas")
    public Map<String, Long> naoLidas(@PathVariable Long produtorId) {
        return Map.of("total", service.contarNaoLidas(produtorId));
    }
}
