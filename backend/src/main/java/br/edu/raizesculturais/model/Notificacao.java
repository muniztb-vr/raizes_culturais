package br.edu.raizesculturais.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificacoes")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notificacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produtor_id", nullable = false)
    private Produtor produtor;

    @NotBlank
    @Column(nullable = false)
    private String texto;

    @Builder.Default
    private String tipo = "info"; // "mensagem" | "evento" | "avaliacao" | "info"

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime data = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private boolean lida = false;
}
