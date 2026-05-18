package br.edu.raizesculturais.controller;

import br.edu.raizesculturais.dto.AvaliacaoDTO;
import br.edu.raizesculturais.service.AvaliacaoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AvaliacaoController {

    private final AvaliacaoService service;

    @GetMapping("/api/produtores/{produtorId}/avaliacoes")
    public List<AvaliacaoDTO> listar(@PathVariable Long produtorId) {
        return service.listarPorProdutor(produtorId);
    }

    @GetMapping("/api/produtores/{produtorId}/avaliacoes/resumo")
    public Map<String, Object> resumo(@PathVariable Long produtorId) {
        return service.resumo(produtorId);
    }

    @PostMapping("/api/avaliacoes")
    @ResponseStatus(HttpStatus.CREATED)
    public AvaliacaoDTO criar(@RequestBody @Valid AvaliacaoDTO dto) {
        return service.criar(dto);
    }
}
