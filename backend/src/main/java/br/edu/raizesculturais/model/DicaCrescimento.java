package br.edu.raizesculturais.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "dicas_crescimento")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DicaCrescimento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String titulo;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String conteudo;

    @Builder.Default
    private String categoria = "geral"; // "marketing" | "financas" | "producao" | "geral"

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();
}
