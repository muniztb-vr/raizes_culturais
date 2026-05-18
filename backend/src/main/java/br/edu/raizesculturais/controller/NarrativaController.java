package br.edu.raizesculturais.controller;

import br.edu.raizesculturais.dto.NarrativaResponseDTO;
import br.edu.raizesculturais.dto.TranscricaoDTO;
import br.edu.raizesculturais.service.NarrativaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/narrativa")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class NarrativaController {

    private final NarrativaService narrativaService;

    @PostMapping("/produtor")
    public NarrativaResponseDTO gerarNarrativa(@RequestBody @Valid TranscricaoDTO dto) {
        return narrativaService.gerarNarrativa(dto);
    }
}
