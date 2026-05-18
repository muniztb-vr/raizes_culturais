package br.edu.raizesculturais.service;

import br.edu.raizesculturais.dto.AvaliacaoDTO;
import br.edu.raizesculturais.model.Avaliacao;
import br.edu.raizesculturais.repository.AvaliacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AvaliacaoService {

    private final AvaliacaoRepository avaliacaoRepository;
    private final ProdutorService produtorService;

    public List<AvaliacaoDTO> listarPorProdutor(Long produtorId) {
        return avaliacaoRepository.findByProdutorIdOrderByDataCriacaoDesc(produtorId)
                .stream().map(this::toDTO).toList();
    }

    public AvaliacaoDTO criar(AvaliacaoDTO dto) {
        var produtor = produtorService.findOrThrow(dto.produtorId());
        Avaliacao a = Avaliacao.builder()
                .produtor(produtor)
                .nomeAvaliador(dto.nomeAvaliador())
                .nota(dto.nota())
                .comentario(dto.comentario())
                .build();
        return toDTO(avaliacaoRepository.save(a));
    }

    public Map<String, Object> resumo(Long produtorId) {
        var lista = avaliacaoRepository.findByProdutorIdOrderByDataCriacaoDesc(produtorId);
        double media = lista.stream().mapToInt(Avaliacao::getNota).average().orElse(0.0);
        var distribuicao = Map.of(
                "5", lista.stream().filter(a -> a.getNota() == 5).count(),
                "4", lista.stream().filter(a -> a.getNota() == 4).count(),
                "3", lista.stream().filter(a -> a.getNota() == 3).count(),
                "2", lista.stream().filter(a -> a.getNota() == 2).count(),
                "1", lista.stream().filter(a -> a.getNota() == 1).count()
        );
        return Map.of("media", media, "total", lista.size(), "distribuicao", distribuicao);
    }

    private AvaliacaoDTO toDTO(Avaliacao a) {
        return new AvaliacaoDTO(a.getId(), a.getProdutor().getId(),
                a.getNomeAvaliador(), a.getNota(), a.getComentario(), a.getDataCriacao());
    }
}
