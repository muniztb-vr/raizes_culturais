package br.edu.raizesculturais.dto;

import jakarta.validation.constraints.NotBlank;

public record ProdutorDTO(
        Long id,
        @NotBlank(message = "Nome é obrigatório") String nome,
        String bio,
        String localidade,
        String contato,
        String fotoUrl,
        String email,
        String narrativa,
        String cpf,
        String municipio,
        String endereco,
        Integer anoInicio,
        String fotoProducaoUrl,
        String categoriaProd
) {}
