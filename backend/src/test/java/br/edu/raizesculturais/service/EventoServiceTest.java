package br.edu.raizesculturais.service;

import br.edu.raizesculturais.dto.EventoDTO;
import br.edu.raizesculturais.model.Evento;
import br.edu.raizesculturais.repository.EventoRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("EventoService — filtros e regras de expiração")
class EventoServiceTest {

    @Mock EventoRepository repo;
    @InjectMocks EventoService service;

    private Evento evento(Long id, String nome, LocalDate dataFim) {
        return Evento.builder()
                .id(id).nome(nome)
                .dataInicio(dataFim.minusDays(3))
                .dataFim(dataFim)
                .cidade("Ouro Preto").estado("MG")
                .vagasExpositor(50).vagasVisitante(200)
                .dataCriacao(LocalDateTime.now())
                .entradaGratuita(true)
                .build();
    }

    // ── T13: Filtro de eventos ativos ─────────────────────────────────────────

    @Test
    @DisplayName("T13 — listarAtivos deve retornar apenas eventos com dataFim >= hoje")
    void deveRetornarApenasEventosAtivos() {
        Evento ativo = evento(1L, "Feira Ativa", LocalDate.now().plusDays(10));

        // O repo já filtra por dataFim >= hoje — retorna apenas ativo
        when(repo.findByDataFimGreaterThanEqualOrderByDataInicioAsc(any(LocalDate.class)))
            .thenReturn(List.of(ativo));
        when(repo.countExpositores(any())).thenReturn(0);
        when(repo.sumVisitantes(any())).thenReturn(0);

        List<EventoDTO> result = service.listarAtivos();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).nome()).isEqualTo("Feira Ativa");
    }

    // ── T14: Gestor vê todos incluindo expirados ───────────────────────────────

    @Test
    @DisplayName("T14 — listarTodos deve incluir eventos expirados para o gestor")
    void gestorDeveVerEventosExpirados() {
        List<Evento> todos = List.of(
            evento(1L, "Ativo", LocalDate.now().plusDays(5)),
            evento(2L, "Expirado", LocalDate.now().minusDays(3))
        );
        when(repo.findAll()).thenReturn(todos);
        when(repo.countExpositores(any())).thenReturn(0);
        when(repo.sumVisitantes(any())).thenReturn(0);

        List<EventoDTO> result = service.listarTodos();

        assertThat(result).hasSize(2);
    }

    // ── T15: Saldo de vagas calculado corretamente ────────────────────────────

    @Test
    @DisplayName("T15 — DTO deve refletir vagas usadas subtraídas das totais")
    void deveMostrarVagasRestantesCorretamente() {
        Evento ev = evento(1L, "Feira", LocalDate.now().plusDays(10));
        ev.setVagasExpositor(80);
        ev.setVagasVisitante(300);

        when(repo.findByDataFimGreaterThanEqualOrderByDataInicioAsc(any())).thenReturn(List.of(ev));
        when(repo.countExpositores(1L)).thenReturn(15);
        when(repo.sumVisitantes(1L)).thenReturn(45);

        EventoDTO dto = service.listarAtivos().get(0);

        assertThat(dto.vagasExpositoresUsadas()).isEqualTo(15);
        assertThat(dto.vagasVisitantesUsadas()).isEqualTo(45);
        // Frontend calcula restantes: 80-15=65 exp, 300-45=255 vis
        assertThat(dto.vagasExpositor() - dto.vagasExpositoresUsadas()).isEqualTo(65);
        assertThat(dto.vagasVisitante() - dto.vagasVisitantesUsadas()).isEqualTo(255);
    }

    // ── T16: Deletar evento inexistente lança 404 ─────────────────────────────

    @Test
    @DisplayName("T16 — Deletar ID inexistente deve lançar 404 NOT FOUND")
    void deveLancar404AoDeletarEventoInexistente() {
        when(repo.existsById(999L)).thenReturn(false);

        assertThatThrownBy(() -> service.deletar(999L))
            .isInstanceOf(ResponseStatusException.class)
            .hasMessageContaining("404");
    }
}
