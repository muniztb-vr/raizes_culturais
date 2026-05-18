package br.edu.raizesculturais.repository;

import br.edu.raizesculturais.model.Avaliacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface AvaliacaoRepository extends JpaRepository<Avaliacao, Long> {
    List<Avaliacao> findByProdutorIdOrderByDataCriacaoDesc(Long produtorId);

    @Query("SELECT AVG(a.nota) FROM Avaliacao a WHERE a.produtor.id = :produtorId")
    Double calcularMediaPorProdutor(Long produtorId);
}
