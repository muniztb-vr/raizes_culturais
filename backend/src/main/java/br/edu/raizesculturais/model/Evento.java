package br.edu.raizesculturais.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "eventos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Evento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String nome;

    private String tipo;
    private String horario;

    @NotNull
    @Column(nullable = false)
    private LocalDate dataInicio;

    @NotNull
    @Column(nullable = false)
    private LocalDate dataFim;

    private String local;
    private String cidade;
    private String estado;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Builder.Default
    private Integer vagasExpositor = 0;

    @Builder.Default
    private Integer vagasVisitante = 0;

    @Builder.Default
    private Integer visitantesEsperados = 0;

    @Builder.Default
    private Boolean entradaGratuita = true;

    @Column(columnDefinition = "TEXT")
    private String fotoUrl;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime dataCriacao = LocalDateTime.now();
}
