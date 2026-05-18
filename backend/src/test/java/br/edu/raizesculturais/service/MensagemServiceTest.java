package br.edu.raizesculturais.service;

import br.edu.raizesculturais.dto.MensagemDTO;
import br.edu.raizesculturais.model.Mensagem;
import br.edu.raizesculturais.model.Notificacao;
import br.edu.raizesculturais.model.Produtor;
import br.edu.raizesculturais.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Apenas interfaces (repositórios JPA) são mockadas — compatível com Java 25.
 * Construtores verificados via javap nos bytecodes gerados por Lombok.
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("MensagemService — subsistema de comunicação")
class MensagemServiceTest {

    @Mock MensagemRepository    mensagemRepo;
    @Mock NotificacaoRepository notificacaoRepo;
    @Mock ProdutorRepository    produtorRepo;
    @Mock ProdutoRepository     produtoRepo;
    @Mock ParticipacaoRepository participacaoRepo;

    @Captor ArgumentCaptor<Notificacao> notifCaptor;

    private MensagemService service;

    @BeforeEach
    void setup() {
        ProdutorService produtorService = new ProdutorService(
                produtorRepo, new BCryptPasswordEncoder(), produtoRepo, participacaoRepo);
        service = new MensagemService(mensagemRepo, notificacaoRepo, produtorService);
    }

    private Produtor produtorFake(Long id) {
        Produtor p = new Produtor();
        p.setId(id);
        p.setNome("Carlos Artesão");
        return p;
    }

    // ── T10: Mensagem persistida e notificação automática ─────────────────────

    @Test
    @DisplayName("T10 — Enviar mensagem deve persistir e criar notificação automática para o produtor")
    void deveEnviarMensagemECriarNotificacao() {
        when(produtorRepo.findById(5L)).thenReturn(Optional.of(produtorFake(5L)));
        when(mensagemRepo.save(any(Mensagem.class))).thenAnswer(inv -> {
            Mensagem m = inv.getArgument(0);
            m.setId(1L);
            return m;
        });
        when(notificacaoRepo.save(any(Notificacao.class))).thenAnswer(inv -> inv.getArgument(0));

        MensagemDTO dto = service.enviar(5L, "Ana Visitante", "ana@test.com",
                "(11) 91111-1111", "Quero comprar seus produtos!");

        assertThat(dto.remetente()).isEqualTo("Ana Visitante");
        assertThat(dto.produtorId()).isEqualTo(5L);
        assertThat(dto.lida()).isFalse();

        verify(notificacaoRepo).save(notifCaptor.capture());
        Notificacao n = notifCaptor.getValue();
        assertThat(n.getTipo()).isEqualTo("mensagem");
        assertThat(n.getTexto()).contains("Ana Visitante");
    }

    // ── T11: Marcar mensagem como lida ────────────────────────────────────────

    @Test
    @DisplayName("T11 — marcarLida deve mudar flag 'lida' para true")
    void deveMarcarMensagemComoLida() {
        Mensagem m = new Mensagem();
        m.setId(1L);
        m.setLida(false);
        m.setRemetente("Visitante");
        m.setConteudo("Olá");
        m.setProdutor(produtorFake(1L));

        when(mensagemRepo.findById(1L)).thenReturn(Optional.of(m));
        when(mensagemRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        MensagemDTO dto = service.marcarLida(1L);

        assertThat(dto.lida()).isTrue();
    }

    // ── T12: Gestor envia mensagem com remetente fixo ─────────────────────────

    @Test
    @DisplayName("T12 — Mensagem do gestor deve ter remetente 'Gestor da Plataforma'")
    void mensagemDoGestorDeveIdentificarRemetente() {
        when(produtorRepo.findById(3L)).thenReturn(Optional.of(produtorFake(3L)));
        when(mensagemRepo.save(any())).thenAnswer(inv -> { Mensagem mm = inv.getArgument(0); mm.setId(2L); return mm; });
        when(notificacaoRepo.save(any())).thenAnswer(inv -> inv.getArgument(0));

        MensagemDTO dto = service.enviar(3L, "Gestor da Plataforma",
                "gestor@raizes.edu.br", "", "Você foi selecionado para o evento!");

        assertThat(dto.remetente()).isEqualTo("Gestor da Plataforma");
    }
}
