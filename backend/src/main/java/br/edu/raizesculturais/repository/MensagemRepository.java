package br.edu.raizesculturais.repository;

import br.edu.raizesculturais.model.Mensagem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MensagemRepository extends JpaRepository<Mensagem, Long> {
    List<Mensagem> findByProdutorIdOrderByDataEnvioDesc(Long produtorId);
    long countByProdutorIdAndLidaFalse(Long produtorId);
}
