package br.edu.raizesculturais.dto;

import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

public record AvaliacaoDTO(
        Long id,
        Long produtorId,
        @NotBlank(message = "Nome do avaliador é obrigatório") String nomeAvaliador,
        @NotNull @Min(1) @Max(5) Integer nota,
        String comentario,
        LocalDateTime dataCriacao
) {}
