package br.edu.raizesculturais.dto;

import jakarta.validation.constraints.NotBlank;

public record TranscricaoDTO(
        @NotBlank(message = "A transcrição não pode ser vazia") String transcricao
) {}
