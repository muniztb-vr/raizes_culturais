package br.edu.raizesculturais.repository;

import br.edu.raizesculturais.model.DicaCrescimento;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DicaCrescimentoRepository extends JpaRepository<DicaCrescimento, Long> {
    List<DicaCrescimento> findAllByOrderByDataCriacaoDesc();
}
