package br.edu.raizesculturais.service;

import br.edu.raizesculturais.model.PasswordResetToken;
import br.edu.raizesculturais.repository.PasswordResetTokenRepository;
import br.edu.raizesculturais.repository.ProdutorRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final PasswordResetTokenRepository tokenRepo;
    private final ProdutorRepository produtorRepo;
    private final BCryptPasswordEncoder passwordEncoder;
    private final RestTemplate restTemplate;

    @Value("${app.frontend.url:https://raizes-culturais.vercel.app}")
    private String frontendUrl;

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    @Value("${RESEND_FROM:Raízes Culturais <onboarding@resend.dev>}")
    private String resendFrom;

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

        if (resendApiKey != null && !resendApiKey.isBlank()) {
            enviarViaResend(email, link);
        } else {
            log.info("┌─────────────────────────────────────────────────────");
            log.info("│  RECUPERAÇÃO DE SENHA — configure RESEND_API_KEY");
            log.info("│  E-mail : {}", email);
            log.info("│  Link   : {}", link);
            log.info("│  Expira : {} (15 min)", LocalDateTime.now().plusMinutes(15));
            log.info("└─────────────────────────────────────────────────────");
        }
    }

    private void enviarViaResend(String destinatario, String link) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(resendApiKey);

            String html = """
                <div style="font-family:sans-serif;max-width:520px;margin:0 auto;padding:32px 24px">
                  <h2 style="color:#0A1F11;font-size:20px;margin-bottom:8px">Recuperação de senha</h2>
                  <p style="color:#555;font-size:15px;line-height:1.6">
                    Recebemos uma solicitação para redefinir a senha da sua conta na
                    <strong>plataforma Raízes Culturais</strong>.
                  </p>
                  <a href="%s"
                    style="display:inline-block;margin:24px 0;padding:14px 28px;
                      background:#0A1F11;color:#fff;text-decoration:none;
                      border-radius:12px;font-weight:600;font-size:15px">
                    Redefinir minha senha
                  </a>
                  <p style="color:#888;font-size:13px">
                    Este link expira em <strong>15 minutos</strong>.
                    Se você não solicitou a recuperação, ignore este e-mail.
                  </p>
                  <hr style="border:none;border-top:1px solid #eee;margin:24px 0"/>
                  <p style="color:#aaa;font-size:12px">Raízes Culturais · Plataforma de Patrimônio Cultural</p>
                </div>
                """.formatted(link);

            Map<String, Object> body = Map.of(
                "from",    resendFrom,
                "to",      List.of(destinatario),
                "subject", "Recuperação de senha — Raízes Culturais",
                "html",    html
            );

            ResponseEntity<Map> resp = restTemplate.exchange(
                "https://api.resend.com/emails",
                HttpMethod.POST,
                new HttpEntity<>(body, headers),
                Map.class
            );

            log.info("[PasswordReset] E-mail enviado via Resend para {} (id={})",
                    destinatario, resp.getBody() != null ? resp.getBody().get("id") : "?");

        } catch (Exception e) {
            log.error("[PasswordReset] Falha ao enviar e-mail via Resend: {}", e.getMessage());
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
