package br.edu.raizesculturais.dto;

import java.time.LocalDateTime;

public record ParticipacaoDTO(
        Long id,
        Long produtorId,
        String nomeProd,
        String cpf,
        String municipio,
        Long eventoId,
        String nomeEvento,
        LocalDateTime dataConfirmacao,
        String tipoParticipacao,
        String nomeVisitante,
        String emailVisitante,
        String whatsappVisitante,
        Integer quantidadePessoas,
        // Campos extras do produtor para exibição no dashboard
        String categoriaProd,
        String contatoProdutor
) {}
