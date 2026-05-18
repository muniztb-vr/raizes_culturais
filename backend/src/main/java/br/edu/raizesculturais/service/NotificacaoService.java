package br.edu.raizesculturais.service;

import br.edu.raizesculturais.dto.NotificacaoDTO;
import br.edu.raizesculturais.model.Notificacao;
import br.edu.raizesculturais.repository.NotificacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificacaoService {

    private final NotificacaoRepository repository;

    public List<NotificacaoDTO> listar(Long produtorId) {
        return repository.findByProdutorIdOrderByDataDesc(produtorId)
                .stream().map(this::toDTO).toList();
    }

    public long contarNaoLidas(Long produtorId) {
        return repository.countByProdutorIdAndLidaFalse(produtorId);
    }

    public NotificacaoDTO marcarLida(Long id) {
        Notificacao n = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificação não encontrada."));
        n.setLida(true);
        return toDTO(repository.save(n));
    }

    public void marcarTodasLidas(Long produtorId) {
        repository.findByProdutorIdOrderByDataDesc(produtorId)
                .forEach(n -> { n.setLida(true); repository.save(n); });
    }

    private NotificacaoDTO toDTO(Notificacao n) {
        return new NotificacaoDTO(n.getId(), n.getProdutor().getId(),
                n.getTexto(), n.getTipo(), n.getData(), n.isLida());
    }
}
