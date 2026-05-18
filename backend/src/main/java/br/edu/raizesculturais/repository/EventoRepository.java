package br.edu.raizesculturais.repository;

import br.edu.raizesculturais.model.Evento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface EventoRepository extends JpaRepository<Evento, Long> {

    // Eventos ativos (dataFim >= hoje) — exibição pública
    List<Evento> findByDataFimGreaterThanEqualOrderByDataInicioAsc(LocalDate hoje);

    // Contagem de expositores confirmados para um evento
    @Query("SELECT COUNT(p) FROM Participacao p WHERE p.eventoId = :eventoId AND p.tipoParticipacao = 'EXPOSITOR'")
    int countExpositores(Long eventoId);

    // Soma de visitantes confirmados para um evento
    @Query("SELECT COALESCE(SUM(p.quantidadePessoas), 0) FROM Participacao p WHERE p.eventoId = :eventoId AND p.tipoParticipacao = 'VISITANTE'")
    int sumVisitantes(Long eventoId);
}
