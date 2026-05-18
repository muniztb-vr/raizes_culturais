package br.edu.raizesculturais.controller;

import br.edu.raizesculturais.dto.EventoDTO;
import br.edu.raizesculturais.service.EventoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class EventoController {

    private final EventoService service;

    // Público: apenas eventos ativos (dataFim >= hoje)
    @GetMapping("/api/eventos")
    public List<EventoDTO> listarAtivos() {
        return service.listarAtivos();
    }

    // Gestor: todos os eventos (incluindo expirados)
    @GetMapping("/api/gestor/eventos")
    public List<EventoDTO> listarTodos() {
        return service.listarTodos();
    }

    @PostMapping("/api/gestor/eventos")
    @ResponseStatus(HttpStatus.CREATED)
    public EventoDTO criar(@RequestBody EventoDTO dto) {
        return service.criar(dto);
    }

    @DeleteMapping("/api/gestor/eventos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
