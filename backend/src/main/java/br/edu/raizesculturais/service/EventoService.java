package br.edu.raizesculturais.service;

import br.edu.raizesculturais.dto.EventoDTO;
import br.edu.raizesculturais.model.Evento;
import br.edu.raizesculturais.repository.EventoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EventoService {

    private final EventoRepository eventoRepository;

    public List<EventoDTO> listarAtivos() {
        return eventoRepository
                .findByDataFimGreaterThanEqualOrderByDataInicioAsc(LocalDate.now())
                .stream().map(this::toDTO).toList();
    }

    public List<EventoDTO> listarTodos() {
        return eventoRepository.findAll().stream()
                .sorted((a, b) -> b.getDataCriacao().compareTo(a.getDataCriacao()))
                .map(this::toDTO).toList();
    }

    public EventoDTO criar(EventoDTO dto) {
        Evento e = Evento.builder()
                .nome(dto.nome())
                .tipo(dto.tipo())
                .horario(dto.horario())
                .dataInicio(dto.dataInicio())
                .dataFim(dto.dataFim())
                .local(dto.local())
                .cidade(dto.cidade())
                .estado(dto.estado())
                .descricao(dto.descricao())
                .vagasExpositor(dto.vagasExpositor() != null ? dto.vagasExpositor() : 0)
                .vagasVisitante(dto.vagasVisitante() != null ? dto.vagasVisitante() : 0)
                .visitantesEsperados(dto.visitantesEsperados() != null ? dto.visitantesEsperados() : 0)
                .entradaGratuita(dto.entradaGratuita() != null ? dto.entradaGratuita() : true)
                .fotoUrl(dto.fotoUrl())
                .build();
        return toDTO(eventoRepository.save(e));
    }

    public void deletar(Long id) {
        if (!eventoRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Evento não encontrado: " + id);
        }
        eventoRepository.deleteById(id);
    }

    private EventoDTO toDTO(Evento e) {
        int expUsados = eventoRepository.countExpositores(e.getId());
        int visUsados = eventoRepository.sumVisitantes(e.getId());
        return new EventoDTO(
                e.getId(), e.getNome(), e.getTipo(), e.getHorario(),
                e.getDataInicio(), e.getDataFim(),
                e.getLocal(), e.getCidade(), e.getEstado(),
                e.getDescricao(),
                e.getVagasExpositor(), e.getVagasVisitante(), e.getVisitantesEsperados(),
                e.getEntradaGratuita(), e.getFotoUrl(), e.getDataCriacao(),
                expUsados, visUsados);
    }
}
