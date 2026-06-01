package br.edu.raizesculturais.repository;

import br.edu.raizesculturais.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {
    List<Produto> findByProdutorId(Long produtorId);
    int countByProdutorId(Long produtorId);
}
