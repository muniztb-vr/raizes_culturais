package br.edu.raizesculturais.controller;

import br.edu.raizesculturais.dto.DicaCrescimentoDTO;
import br.edu.raizesculturais.service.DicaCrescimentoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class DicaCrescimentoController {

    private final DicaCrescimentoService service;

    // Público — todos os produtores podem ler
    @GetMapping("/api/dicas")
    public List<DicaCrescimentoDTO> listar() {
        return service.listar();
    }

    // Gestor cria dica
    @PostMapping("/api/gestor/dicas")
    @ResponseStatus(HttpStatus.CREATED)
    public DicaCrescimentoDTO criar(@RequestBody DicaCrescimentoDTO dto) {
        return service.criar(dto);
    }

    // Gestor exclui dica
    @DeleteMapping("/api/gestor/dicas/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }
}
