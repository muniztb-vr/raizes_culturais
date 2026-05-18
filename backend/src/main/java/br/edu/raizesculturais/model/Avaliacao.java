package br.edu.raizesculturais.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "avaliacoes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Avaliacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produtor_id", nullable = false)
    private Produtor produtor;

    @NotBlank
    private String nomeAvaliador;

    @Min(1) @Max(5)
    @NotNull
    private Integer nota;

    @Column(columnDefinition = "TEXT")
    private String comentario;

    @Builder.Default
    private LocalDateTime dataCriacao = LocalDateTime.now();
}
