package br.edu.raizesculturais.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CadastroDTO(
        @NotBlank(message = "Nome é obrigatório") String nome,
        @NotBlank @Email(message = "E-mail inválido") String email,
        @NotBlank @Size(min = 6, message = "Senha deve ter ao menos 6 caracteres") String senha,
        String cpf,
        String municipio,
        String localidade,
        String endereco,
        Integer anoInicio,
        String bio,
        String contato,
        String fotoUrl,
        String fotoProducaoUrl,
        String categoriaProd
) {}
