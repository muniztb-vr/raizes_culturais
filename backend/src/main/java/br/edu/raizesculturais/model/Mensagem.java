package br.edu.raizesculturais.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "mensagens")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Mensagem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String remetente;

    private String emailRemetente;
    private String whatsappRemetente;

    @NotNull
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produtor_id", nullable = false)
    private Produtor produtor;

    @NotBlank
    @Column(columnDefinition = "TEXT", nullable = false)
    private String conteudo;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime dataEnvio = LocalDateTime.now();

    @Builder.Default
    @Column(nullable = false)
    private boolean lida = false;
}
