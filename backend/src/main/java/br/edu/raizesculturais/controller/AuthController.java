package br.edu.raizesculturais.controller;

import br.edu.raizesculturais.dto.CadastroDTO;
import br.edu.raizesculturais.dto.LoginDTO;
import br.edu.raizesculturais.dto.ProdutorDTO;
import br.edu.raizesculturais.service.ProdutorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class AuthController {

    private final ProdutorService service;

    @PostMapping("/cadastro")
    @ResponseStatus(HttpStatus.CREATED)
    public ProdutorDTO cadastrar(@RequestBody @Valid CadastroDTO dto) {
        return service.registrar(dto);
    }

    @PostMapping("/login")
    public ProdutorDTO login(@RequestBody @Valid LoginDTO dto) {
        return service.login(dto);
    }
}
