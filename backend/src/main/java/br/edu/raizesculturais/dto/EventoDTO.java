package br.edu.raizesculturais.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record EventoDTO(
        Long id,
        String nome,
        String tipo,
        String horario,
        LocalDate dataInicio,
        LocalDate dataFim,
        String local,
        String cidade,
        String estado,
        String descricao,
        Integer vagasExpositor,
        Integer vagasVisitante,
        Integer visitantesEsperados,
        Boolean entradaGratuita,
        String fotoUrl,
        LocalDateTime dataCriacao,
        // Vagas usadas — calculadas no service a partir das participações
        Integer vagasExpositoresUsadas,
        Integer vagasVisitantesUsadas
) {}
