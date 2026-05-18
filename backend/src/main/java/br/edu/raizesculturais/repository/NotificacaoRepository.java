package br.edu.raizesculturais.repository;

import br.edu.raizesculturais.model.Notificacao;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificacaoRepository extends JpaRepository<Notificacao, Long> {
    List<Notificacao> findByProdutorIdOrderByDataDesc(Long produtorId);
    long countByProdutorIdAndLidaFalse(Long produtorId);
}
