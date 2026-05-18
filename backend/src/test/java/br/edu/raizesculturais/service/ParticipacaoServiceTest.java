package br.edu.raizesculturais.service;

import br.edu.raizesculturais.dto.ParticipacaoDTO;
import br.edu.raizesculturais.model.Participacao;
import br.edu.raizesculturais.model.Produtor;
import br.edu.raizesculturais.repository.ParticipacaoRepository;
import br.edu.raizesculturais.repository.ProdutoRepository;
import br.edu.raizesculturais.repository.ProdutorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Apenas interfaces (repositórios JPA) são mockadas — compatível com Java 25.
 * Construtores verificados via: javap -p target/classes/.../ProdutorService.class
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("ParticipacaoService — regras de negócio")
class ParticipacaoServiceTest {

    // Todos são interfaces JPA — Mockito não precisa de bytecode manipulation
    @Mock ParticipacaoRepository participacaoRepo;
    @Mock ProdutorRepository     produtorRepo;
    @Mock ProdutoRepository      produtoRepo;

    private ParticipacaoService service;

    @BeforeEach
    void setup() {
        // Construtores gerados por @RequiredArgsConstructor confirmados via javap
        ProdutorService produtorService = new ProdutorService(
                produtorRepo, new BCryptPasswordEncoder(), produtoRepo, participacaoRepo);
        service = new ParticipacaoService(participacaoRepo, produtorService);
    }

    private Produtor produtorFake(Long id) {
        Produtor p = new Produtor();
        p.setId(id);
        p.setNome("Maria Silva");
        p.setCpf("111.111.111-11");
        p.setMunicipio("Ouro Preto");
        p.setCategoriaProd("CAFE");
        p.setContato("(31) 99999-0000");
        return p;
    }

    // ── T06: Expositor — inscrição bem-sucedida ───────────────────────────────

    @Test
    @DisplayName("T06 — Expositor autenticado deve confirmar participação com tipo EXPOSITOR")
    void expositorDeveConfirmarParticipacaoComSucesso() {
        when(produtorRepo.findById(1L)).thenReturn(Optional.of(produtorFake(1L)));
        when(participacaoRepo.findByProdutorIdAndEventoId(1L, 10L)).thenReturn(Optional.empty());
        when(participacaoRepo.save(any(Participacao.class))).thenAnswer(inv -> {
            Participacao p = inv.getArgument(0);
            p.setId(99L);
            return p;
        });

        ParticipacaoDTO dto = service.confirmar(1L, 10L, "Feira das Tradições");

        assertThat(dto.tipoParticipacao()).isEqualTo("EXPOSITOR");
        assertThat(dto.produtorId()).isEqualTo(1L);
        verify(participacaoRepo).save(any(Participacao.class));
    }

    // ── T07: Expositor — dupla inscrição bloqueada ────────────────────────────

    @Test
    @DisplayName("T07 — Segunda inscrição do mesmo expositor no mesmo evento deve lançar 409")
    void deveBloquearDuplaInscricaoDoExpositor() {
        when(participacaoRepo.findByProdutorIdAndEventoId(1L, 10L))
                .thenReturn(Optional.of(new Participacao()));

        assertThatThrownBy(() -> service.confirmar(1L, 10L, "Feira"))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("409");
    }

    // ── T08: Visitante — inscrição com múltiplas pessoas ─────────────────────

    @Test
    @DisplayName("T08 — Visitante deve inscrever grupo sem login (produtorId null)")
    void visitanteDeveInscreverGrupoSemLogin() {
        when(participacaoRepo.existsByEmailVisitanteAndEventoId("visitante@test.com", 10L)).thenReturn(false);
        when(participacaoRepo.save(any(Participacao.class))).thenAnswer(inv -> {
            Participacao p = inv.getArgument(0);
            p.setId(100L);
            return p;
        });

        ParticipacaoDTO dto = service.confirmarVisitante(
                10L, "Feira das Tradições", "João Visitante",
                "visitante@test.com", "(21) 99999-8888", 5);

        assertThat(dto.tipoParticipacao()).isEqualTo("VISITANTE");
        assertThat(dto.quantidadePessoas()).isEqualTo(5);
        assertThat(dto.produtorId()).isNull();
    }

    // ── T09: Visitante — e-mail duplicado bloqueado ───────────────────────────

    @Test
    @DisplayName("T09 — Segundo cadastro com mesmo e-mail no mesmo evento deve lançar 409")
    void deveBloquearEmailDuplicadoDoVisitante() {
        when(participacaoRepo.existsByEmailVisitanteAndEventoId("dup@test.com", 10L)).thenReturn(true);

        assertThatThrownBy(() -> service.confirmarVisitante(
                10L, "Feira", "Outro", "dup@test.com", "", 1))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("409");
    }
}
