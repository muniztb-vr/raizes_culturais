package br.edu.raizesculturais.controller;

import br.edu.raizesculturais.service.PasswordResetService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService service;

    // Solicitar link de recuperação
    @PostMapping("/forgot-password")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, String> solicitarRecuperacao(@RequestBody Map<String, String> body) {
        service.solicitarRecuperacao(body.getOrDefault("email", "").trim());
        // Resposta sempre igual — não revela se e-mail existe
        return Map.of("message",
                "Se o e-mail estiver cadastrado, você receberá instruções em breve.");
    }

    // Redefinir senha com token
    @PostMapping("/reset-password")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, String> redefinirSenha(@RequestBody Map<String, String> body) {
        service.redefinirSenha(
                body.getOrDefault("token", ""),
                body.getOrDefault("novaSenha", "")
        );
        return Map.of("message", "Senha redefinida com sucesso! Faça login com a nova senha.");
    }

    // Alterar senha (produtor autenticado)
    @PutMapping("/produtores/{id}/senha")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, String> alterarSenha(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        service.alterarSenha(
                id,
                body.getOrDefault("senhaAtual", ""),
                body.getOrDefault("novaSenha", "")
        );
        return Map.of("message", "Senha alterada com sucesso!");
    }
}
