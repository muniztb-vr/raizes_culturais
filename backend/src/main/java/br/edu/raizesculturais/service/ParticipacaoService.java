package br.edu.raizesculturais.service;

import br.edu.raizesculturais.dto.ParticipacaoDTO;
import br.edu.raizesculturais.model.Participacao;
import br.edu.raizesculturais.model.Produtor;
import br.edu.raizesculturais.repository.ParticipacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ParticipacaoService {

    private final ParticipacaoRepository participacaoRepository;
    private final ProdutorService produtorService;

    public List<ParticipacaoDTO> listarPorProdutor(Long produtorId) {
        return participacaoRepository.findByProdutorId(produtorId)
                .stream().map(this::toDTO).toList();
    }

    public List<ParticipacaoDTO> listarTodas() {
        return participacaoRepository.findAllByOrderByDataConfirmacaoDesc()
                .stream().map(this::toDTO).toList();
    }

    public ParticipacaoDTO confirmar(Long produtorId, Long eventoId, String nomeEvento) {
        if (participacaoRepository.findByProdutorIdAndEventoId(produtorId, eventoId).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Participação já confirmada.");
        }
        Produtor produtor = produtorService.findOrThrow(produtorId);
        Participacao p = Participacao.builder()
                .produtor(produtor)
                .eventoId(eventoId)
                .nomeEvento(nomeEvento)
                .tipoParticipacao("EXPOSITOR")
                .build();
        return toDTO(participacaoRepository.save(p));
    }

    public ParticipacaoDTO confirmarVisitante(Long eventoId, String nomeEvento,
                                              String nomeVisitante, String emailVisitante,
                                              String whatsappVisitante, int quantidadePessoas) {
        if (participacaoRepository.existsByEmailVisitanteAndEventoId(emailVisitante, eventoId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Este e-mail já está inscrito neste evento.");
        }
        Participacao p = Participacao.builder()
                .eventoId(eventoId)
                .nomeEvento(nomeEvento)
                .tipoParticipacao("VISITANTE")
                .nomeVisitante(nomeVisitante)
                .emailVisitante(emailVisitante)
                .whatsappVisitante(whatsappVisitante)
                .quantidadePessoas(quantidadePessoas)
                .build();
        return toDTO(participacaoRepository.save(p));
    }

    public void cancelar(Long produtorId, Long eventoId) {
        participacaoRepository.findByProdutorIdAndEventoId(produtorId, eventoId)
                .ifPresent(participacaoRepository::delete);
    }

    private ParticipacaoDTO toDTO(Participacao p) {
        Produtor prod = p.getProdutor();
        return new ParticipacaoDTO(
                p.getId(),
                prod != null ? prod.getId() : null,
                prod != null ? prod.getNome() : null,
                prod != null ? prod.getCpf() : null,
                prod != null ? (prod.getMunicipio() != null ? prod.getMunicipio() : prod.getLocalidade()) : null,
                p.getEventoId(),
                p.getNomeEvento(),
                p.getDataConfirmacao(),
                p.getTipoParticipacao() != null ? p.getTipoParticipacao() : "EXPOSITOR",
                p.getNomeVisitante(),
                p.getEmailVisitante(),
                p.getWhatsappVisitante(),
                p.getQuantidadePessoas(),
                prod != null ? prod.getCategoriaProd() : null,
                prod != null ? prod.getContato() : null);
    }
}
