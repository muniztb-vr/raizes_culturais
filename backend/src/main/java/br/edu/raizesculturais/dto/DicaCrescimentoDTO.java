package br.edu.raizesculturais.dto;

import java.time.LocalDateTime;

public record DicaCrescimentoDTO(
        Long id,
        String titulo,
        String conteudo,
        String categoria,
        LocalDateTime dataCriacao
) {}
