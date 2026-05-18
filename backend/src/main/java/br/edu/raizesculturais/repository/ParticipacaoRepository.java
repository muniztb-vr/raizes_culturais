package br.edu.raizesculturais.repository;

import br.edu.raizesculturais.model.Participacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ParticipacaoRepository extends JpaRepository<Participacao, Long> {
    List<Participacao> findByProdutorId(Long produtorId);
    Optional<Participacao> findByProdutorIdAndEventoId(Long produtorId, Long eventoId);
    boolean existsByEmailVisitanteAndEventoId(String emailVisitante, Long eventoId);
    List<Participacao> findAllByOrderByDataConfirmacaoDesc();
}
