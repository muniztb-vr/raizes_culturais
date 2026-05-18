package br.edu.raizesculturais.controller;

import br.edu.raizesculturais.dto.CadastroDTO;
import br.edu.raizesculturais.dto.ProdutorDTO;
import br.edu.raizesculturais.service.ProdutorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/produtores")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class ProdutorController {

    private final ProdutorService service;

    @GetMapping
    public List<ProdutorDTO> listar() {
        return service.listarTodos();
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProdutorDTO> buscar(@PathVariable Long id) {
        return ResponseEntity.ok(service.buscarPorId(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProdutorDTO criar(@RequestBody @Valid ProdutorDTO dto) {
        return service.criar(dto);
    }

    @PutMapping("/{id}")
    public ProdutorDTO atualizar(@PathVariable Long id, @RequestBody @Valid ProdutorDTO dto) {
        return service.atualizar(id, dto);
    }

    @PutMapping("/{id}/configuracoes")
    public ProdutorDTO atualizarConfiguracoes(@PathVariable Long id, @RequestBody @Valid ProdutorDTO dto) {
        return service.atualizarConfiguracoes(id, dto);
    }

    @PutMapping("/{id}/narrativa")
    public ProdutorDTO atualizarNarrativa(@PathVariable Long id,
                                           @RequestBody Map<String, String> body) {
        return service.atualizarNarrativa(id, body.get("narrativa"));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletar(@PathVariable Long id) {
        service.deletar(id);
    }

    // Gestor: cadastrar produtor manualmente (com hash de senha)
    @PostMapping("/gestor/cadastrar")
    @ResponseStatus(HttpStatus.CREATED)
    public ProdutorDTO cadastrarPeloGestor(@RequestBody @Valid CadastroDTO dto) {
        return service.registrar(dto);
    }
}
