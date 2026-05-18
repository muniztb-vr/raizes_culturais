package br.edu.raizesculturais.service;

import br.edu.raizesculturais.dto.DicaCrescimentoDTO;
import br.edu.raizesculturais.model.DicaCrescimento;
import br.edu.raizesculturais.repository.DicaCrescimentoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DicaCrescimentoService {

    private final DicaCrescimentoRepository repository;

    public List<DicaCrescimentoDTO> listar() {
        return repository.findAllByOrderByDataCriacaoDesc()
                .stream().map(this::toDTO).toList();
    }

    public DicaCrescimentoDTO criar(DicaCrescimentoDTO dto) {
        DicaCrescimento d = DicaCrescimento.builder()
                .titulo(dto.titulo())
                .conteudo(dto.conteudo())
                .categoria(dto.categoria() != null ? dto.categoria() : "geral")
                .build();
        return toDTO(repository.save(d));
    }

    public void deletar(Long id) {
        if (!repository.existsById(id))
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Dica não encontrada.");
        repository.deleteById(id);
    }

    private DicaCrescimentoDTO toDTO(DicaCrescimento d) {
        return new DicaCrescimentoDTO(d.getId(), d.getTitulo(), d.getConteudo(),
                d.getCategoria(), d.getDataCriacao());
    }
}
