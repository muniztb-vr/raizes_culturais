package br.edu.raizesculturais.repository;

import br.edu.raizesculturais.model.Produtor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProdutorRepository extends JpaRepository<Produtor, Long> {
    List<Produtor> findByLocalidadeContainingIgnoreCase(String localidade);
    Optional<Produtor> findByEmail(String email);
    boolean existsByEmail(String email);
}
