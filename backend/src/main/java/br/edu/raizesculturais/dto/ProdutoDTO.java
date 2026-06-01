package br.edu.raizesculturais.dto;

import jakarta.validation.constraints.NotBlank;

public record ProdutoDTO(
        Long id,
        @NotBlank(message = "Nome do produto é obrigatório") String nome,
        Integer quantidade,
        String descricao,
        String contato,
        String categoria,
        Long produtorId,
        String preco,
        String fotoUrl
) {}
