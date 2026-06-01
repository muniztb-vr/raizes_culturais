package br.edu.raizesculturais.repository;

import br.edu.raizesculturais.model.Produto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ProdutoRepository extends JpaRepository<Produto, Long> {

    @Query("SELECT p FROM Produto p WHERE p.produtor.id = :produtorId")
    List<Produto> findByProdutorId(Long produtorId);

    @Query("SELECT p.produtor.id, COUNT(p) FROM Produto p GROUP BY p.produtor.id")
    List<Object[]> contarPorProdutor();

    @Query("SELECT COUNT(p) FROM Produto p WHERE p.produtor.id = :produtorId")
    long contarPorProdutorId(Long produtorId);
}
