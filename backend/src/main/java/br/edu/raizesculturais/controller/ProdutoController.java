package br.edu.raizesculturais.controller;

import br.edu.raizesculturais.dto.ProdutoDTO;
import br.edu.raizesculturais.service.ProdutoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ProdutoController {

    private final ProdutoService service;

    @GetMapping("/api/produtores/{produtorId}/produtos")
    public List<ProdutoDTO> listar(@PathVariable Long produtorId) {
        return service.listarPorProdutor(produtorId);
    }

    @PostMapping("/api/produtos")
    @ResponseStatus(HttpStatus.CREATED)
    public ProdutoDTO criar(@RequestBody @Valid ProdutoDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/api/produtos/{id}")
    public ProdutoDTO atualizar(@PathVariable Long id, @RequestBody @Valid ProdutoDTO dto) {
        return service.atualizar(id, dto);
    }

    @DeleteMapping("/api/produtos/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
