package br.edu.raizesculturais.dto;

import java.time.LocalDateTime;

public record MensagemDTO(
        Long id,
        String remetente,
        String emailRemetente,
        String whatsappRemetente,
        Long produtorId,
        String conteudo,
        LocalDateTime dataEnvio,
        boolean lida
) {}
