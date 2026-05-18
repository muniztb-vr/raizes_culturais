package br.edu.raizesculturais.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Entity
@Table(name = "produtores")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Produtor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String localidade;
    private String contato;

    @Column(columnDefinition = "TEXT")
    private String fotoUrl;

    @Column(unique = true)
    private String email;

    private String senha;

    @Column(columnDefinition = "TEXT")
    private String narrativa;

    // Novos campos do cadastro robusto
    @Column(unique = true)
    private String cpf;

    private String municipio;

    @Column(columnDefinition = "TEXT")
    private String endereco;

    private Integer anoInicio;

    @Column(columnDefinition = "TEXT")
    private String fotoProducaoUrl;

    private String categoriaProd;
}
