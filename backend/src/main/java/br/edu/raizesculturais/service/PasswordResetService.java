package br.edu.raizesculturais.service;

import br.edu.raizesculturais.model.PasswordResetToken;
import br.edu.raizesculturais.repository.PasswordResetTokenRepository;
import br.edu.raizesculturais.repository.ProdutorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
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
    private final JavaMailSender mailSender;

    @Value("${app.frontend.url:https://raizes-culturais.vercel.app}")
    private String frontendUrl;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    // ── Solicitar recuperação ─────────────────────────────────────────────────

    public void solicitarRecuperacao(String email) {
        if (!produtorRepo.existsByEmail(email)) {
            log.warn("[PasswordReset] E-mail não encontrado: {}", email);
            return;
        }

        tokenRepo.limparTokensExpirados(LocalDateTime.now());

        String token = UUID.randomUUID().toString();
        tokenRepo.save(PasswordResetToken.builder()
                .token(token)
                .email(email)
                .expiresAt(LocalDateTime.now().plusMinutes(15))
                .build());

        String link = frontendUrl + "/redefinir-senha?token=" + token;

        if (mailUsername != null && !mailUsername.isBlank()) {
            enviarEmail(email, link);
        } else {
            // Fallback: log no console se e-mail não configurado
            log.info("┌─────────────────────────────────────────────────────");
            log.info("│  RECUPERAÇÃO DE SENHA — Raízes Culturais");
            log.info("│  E-mail : {}", email);
            log.info("│  Link   : {}", link);
            log.info("│  Expira : {} (15 min)", LocalDateTime.now().plusMinutes(15));
            log.info("└─────────────────────────────────────────────────────");
        }
    }

    private void enviarEmail(String destinatario, String link) {
        try {
            SimpleMailMessage msg = new SimpleMailMessage();
            msg.setFrom("Raízes Culturais <" + mailUsername + ">");
            msg.setTo(destinatario);
            msg.setSubject("Recuperação de senha — Raízes Culturais");
            msg.setText("""
                    Olá!

                    Recebemos uma solicitação para redefinir a senha da sua conta na plataforma Raízes Culturais.

                    Clique no link abaixo para criar uma nova senha (válido por 15 minutos):

                    %s

                    Se você não solicitou a recuperação de senha, ignore este e-mail. Sua senha permanece a mesma.

                    Atenciosamente,
                    Equipe Raízes Culturais
                    """.formatted(link));
            mailSender.send(msg);
            log.info("[PasswordReset] E-mail enviado para: {}", destinatario);
        } catch (Exception e) {
            log.error("[PasswordReset] Falha ao enviar e-mail para {}: {}", destinatario, e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Não foi possível enviar o e-mail. Tente novamente em instantes.");
        }
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
