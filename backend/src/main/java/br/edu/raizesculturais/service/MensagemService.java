package br.edu.raizesculturais.service;

import br.edu.raizesculturais.dto.MensagemDTO;
import br.edu.raizesculturais.model.Mensagem;
import br.edu.raizesculturais.model.Notificacao;
import br.edu.raizesculturais.model.Produtor;
import br.edu.raizesculturais.repository.MensagemRepository;
import br.edu.raizesculturais.repository.NotificacaoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MensagemService {

    private final MensagemRepository mensagemRepository;
    private final NotificacaoRepository notificacaoRepository;
    private final ProdutorService produtorService;

    public MensagemDTO enviar(Long produtorId, String remetente, String email,
                              String whatsapp, String conteudo) {
        Produtor produtor = produtorService.findOrThrow(produtorId);

        Mensagem m = Mensagem.builder()
                .remetente(remetente)
                .emailRemetente(email)
                .whatsappRemetente(whatsapp)
                .produtor(produtor)
                .conteudo(conteudo)
                .build();
        mensagemRepository.save(m);

        // Notificação automática para o produtor
        notificacaoRepository.save(Notificacao.builder()
                .produtor(produtor)
                .texto("Nova mensagem de " + remetente + ": \"" + truncar(conteudo, 60) + "\"")
                .tipo("mensagem")
                .build());

        return toDTO(m);
    }

    public List<MensagemDTO> listar(Long produtorId) {
        return mensagemRepository.findByProdutorIdOrderByDataEnvioDesc(produtorId)
                .stream().map(this::toDTO).toList();
    }

    public MensagemDTO marcarLida(Long mensagemId) {
        Mensagem m = mensagemRepository.findById(mensagemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Mensagem não encontrada."));
        m.setLida(true);
        return toDTO(mensagemRepository.save(m));
    }

    public long contarNaoLidas(Long produtorId) {
        return mensagemRepository.countByProdutorIdAndLidaFalse(produtorId);
    }

    private MensagemDTO toDTO(Mensagem m) {
        return new MensagemDTO(m.getId(), m.getRemetente(), m.getEmailRemetente(),
                m.getWhatsappRemetente(), m.getProdutor().getId(),
                m.getConteudo(), m.getDataEnvio(), m.isLida());
    }

    private String truncar(String s, int max) {
        return s.length() > max ? s.substring(0, max) + "..." : s;
    }
}
