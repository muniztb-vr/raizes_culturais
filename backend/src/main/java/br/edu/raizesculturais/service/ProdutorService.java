package br.edu.raizesculturais.service;

import br.edu.raizesculturais.dto.CadastroDTO;
import br.edu.raizesculturais.dto.LoginDTO;
import br.edu.raizesculturais.dto.ProdutorDTO;
import br.edu.raizesculturais.model.Produtor;
import br.edu.raizesculturais.repository.ParticipacaoRepository;
import br.edu.raizesculturais.repository.ProdutoRepository;
import br.edu.raizesculturais.repository.ProdutorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProdutorService {

    private final ProdutorRepository repository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ProdutoRepository produtoRepository;
    private final ParticipacaoRepository participacaoRepository;

    // ── Listagem / Busca ─────────────────────────────────────────────────────

    public List<ProdutorDTO> listarTodos() {
        return repository.findAll().stream().map(this::toDTO).toList();
    }

    public ProdutorDTO buscarPorId(Long id) {
        return toDTO(findOrThrow(id));
    }

    // ── CRUD padrão ──────────────────────────────────────────────────────────

    public ProdutorDTO criar(ProdutorDTO dto) {
        return toDTO(repository.save(toEntity(dto)));
    }

    public ProdutorDTO atualizar(Long id, ProdutorDTO dto) {
        Produtor p = findOrThrow(id);
        p.setNome(dto.nome());
        p.setBio(dto.bio());
        p.setLocalidade(dto.localidade());
        p.setContato(dto.contato());
        p.setFotoUrl(dto.fotoUrl());
        p.setMunicipio(dto.municipio());
        p.setEndereco(dto.endereco());
        p.setAnoInicio(dto.anoInicio());
        p.setFotoProducaoUrl(dto.fotoProducaoUrl());
        p.setCategoriaProd(dto.categoriaProd());
        return toDTO(repository.save(p));
    }

    @Transactional
    public void deletar(Long id) {
        findOrThrow(id);
        // Cascade manual: remove produtos e participações vinculadas
        produtoRepository.deleteAll(produtoRepository.findByProdutorId(id));
        participacaoRepository.deleteAll(participacaoRepository.findByProdutorId(id));
        repository.deleteById(id);
    }

    // ── Auth ─────────────────────────────────────────────────────────────────

    public ProdutorDTO registrar(CadastroDTO dto) {
        if (repository.existsByEmail(dto.email())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado.");
        }
        Produtor p = Produtor.builder()
                .nome(dto.nome())
                .email(dto.email())
                .senha(passwordEncoder.encode(dto.senha()))
                .cpf(dto.cpf())
                .municipio(dto.municipio())
                .localidade(dto.localidade())
                .endereco(dto.endereco())
                .anoInicio(dto.anoInicio())
                .bio(dto.bio())
                .contato(dto.contato())
                .fotoUrl(dto.fotoUrl())
                .fotoProducaoUrl(dto.fotoProducaoUrl())
                .categoriaProd(dto.categoriaProd())
                .build();
        return toDTO(repository.save(p));
    }

    public ProdutorDTO login(LoginDTO dto) {
        Produtor p = repository.findByEmail(dto.email())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos."));
        if (!passwordEncoder.matches(dto.senha(), p.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos.");
        }
        return toDTO(p);
    }

    // ── Configurações (atualiza todos os dados cadastrais) ────────────────────

    public ProdutorDTO atualizarConfiguracoes(Long id, ProdutorDTO dto) {
        Produtor p = findOrThrow(id);
        p.setNome(dto.nome());
        p.setBio(dto.bio());
        p.setLocalidade(dto.localidade());
        p.setMunicipio(dto.municipio());
        p.setEndereco(dto.endereco());
        p.setContato(dto.contato());
        p.setAnoInicio(dto.anoInicio());
        p.setFotoUrl(dto.fotoUrl());
        p.setFotoProducaoUrl(dto.fotoProducaoUrl());
        p.setCategoriaProd(dto.categoriaProd());
        return toDTO(repository.save(p));
    }

    // ── Narrativa IA ─────────────────────────────────────────────────────────

    public ProdutorDTO atualizarNarrativa(Long id, String narrativa) {
        Produtor p = findOrThrow(id);
        p.setNarrativa(narrativa);
        return toDTO(repository.save(p));
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public Produtor findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Produtor não encontrado: " + id));
    }

    public ProdutorDTO toDTO(Produtor p) {
        return new ProdutorDTO(
                p.getId(), p.getNome(), p.getBio(), p.getLocalidade(),
                p.getContato(), p.getFotoUrl(), p.getEmail(), p.getNarrativa(),
                p.getCpf(), p.getMunicipio(), p.getEndereco(),
                p.getAnoInicio(), p.getFotoProducaoUrl(), p.getCategoriaProd());
    }

    private Produtor toEntity(ProdutorDTO dto) {
        return Produtor.builder()
                .nome(dto.nome()).bio(dto.bio()).localidade(dto.localidade())
                .contato(dto.contato()).fotoUrl(dto.fotoUrl()).email(dto.email())
                .municipio(dto.municipio()).endereco(dto.endereco())
                .anoInicio(dto.anoInicio()).fotoProducaoUrl(dto.fotoProducaoUrl())
                .build();
    }
}
