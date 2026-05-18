package br.edu.raizesculturais.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "participacoes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"produtor_id", "evento_id"})
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Participacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nullable: visitantes não têm produtor vinculado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "produtor_id", nullable = true)
    private Produtor produtor;

    @NotNull
    @Column(name = "evento_id", nullable = false)
    private Long eventoId;

    private String nomeEvento;

    @Builder.Default
    private LocalDateTime dataConfirmacao = LocalDateTime.now();

    // "EXPOSITOR" | "VISITANTE"
    @Builder.Default
    @Column(nullable = false)
    private String tipoParticipacao = "EXPOSITOR";

    // Campos do fluxo visitante (null para expositores)
    private String nomeVisitante;
    private String emailVisitante;
    private String whatsappVisitante;
    private Integer quantidadePessoas;
}
