package br.edu.raizesculturais.service;

import br.edu.raizesculturais.model.PasswordResetToken;
import br.edu.raizesculturais.repository.PasswordResetTokenRepository;
import br.edu.raizesculturais.repository.ProdutorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepo;
    private final ProdutorRepository produtorRepo;
    private final BCryptPasswordEncoder passwordEncoder;

    @Value("${app.frontend.url:https://raizes-culturais.vercel.app}")
    private String frontendUrl;

    // ── Solicitar recuperação ─────────────────────────────────────────────────

    public void solicitarRecuperacao(String email) {
        if (!produtorRepo.existsByEmail(email)) {
            // Resposta neutra — não revela se e-mail existe (segurança)
            log.warn("[PasswordReset] E-mail não encontrado: {}", email);
            return;
        }

        // Limpa tokens anteriores expirados
        tokenRepo.limparTokensExpirados(LocalDateTime.now());

        String token = UUID.randomUUID().toString();
        tokenRepo.save(PasswordResetToken.builder()
                .token(token)
                .email(email)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build());

        String link = frontendUrl + "/redefinir-senha?token=" + token;

        // Em produção, envie por e-mail. Por ora, loga no console (visível nos logs do Render).
        log.info("┌─────────────────────────────────────────────────────");
        log.info("│  RECUPERAÇÃO DE SENHA — Raízes Culturais");
        log.info("│  E-mail  : {}", email);
        log.info("│  Link    : {}", link);
        log.info("│  Expira  : {} (15 min)", LocalDateTime.now().plusMinutes(15));
        log.info("└─────────────────────────────────────────────────────");
    }

    // ── Redefinir senha com token ─────────────────────────────────────────────

    public void redefinirSenha(String token, String novaSenha) {
        PasswordResetToken prt = tokenRepo.findByTokenAndUsadoFalse(token)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.BAD_REQUEST, "Token inválido ou já utilizado."));

        if (prt.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Token expirado. Solicite um novo link de recuperação.");
        }

        produtorRepo.findByEmail(prt.getEmail()).ifPresent(produtor -> {
            produtor.setSenha(passwordEncoder.encode(novaSenha));
            produtorRepo.save(produtor);
        });

        prt.setUsado(true);
        tokenRepo.save(prt);
        log.info("[PasswordReset] Senha redefinida para: {}", prt.getEmail());
    }

    // ── Alterar senha (produtor logado) ──────────────────────────────────────

    public void alterarSenha(Long produtorId, String senhaAtual, String novaSenha) {
        var produtor = produtorRepo.findById(produtorId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Produtor não encontrado."));

        if (!passwordEncoder.matches(senhaAtual, produtor.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                    "Senha atual incorreta.");
        }

        produtor.setSenha(passwordEncoder.encode(novaSenha));
        produtorRepo.save(produtor);
        log.info("[PasswordChange] Senha alterada para produtor id={}", produtorId);
    }
}
