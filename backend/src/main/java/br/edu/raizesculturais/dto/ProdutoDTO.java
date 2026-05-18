package br.edu.raizesculturais.dto;

import br.edu.raizesculturais.model.Categoria;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProdutoDTO(
        Long id,
        @NotBlank(message = "Nome do produto é obrigatório") String nome,
        @NotNull(message = "Quantidade é obrigatória") Integer quantidade,
        String descricao,
        String contato,
        @NotNull(message = "Categoria é obrigatória") Categoria categoria,
        Long produtorId,
        String preco,
        String fotoUrl
) {}
