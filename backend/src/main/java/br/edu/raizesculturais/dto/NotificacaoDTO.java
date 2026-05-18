package br.edu.raizesculturais.dto;

import java.time.LocalDateTime;

public record NotificacaoDTO(
        Long id,
        Long produtorId,
        String texto,
        String tipo,
        LocalDateTime data,
        boolean lida
) {}
