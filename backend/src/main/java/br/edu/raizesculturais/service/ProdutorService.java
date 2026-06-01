package br.edu.raizesculturais.service;

import br.edu.raizesculturais.dto.CadastroDTO;
import br.edu.raizesculturais.dto.LoginDTO;
import br.edu.raizesculturais.dto.ProdutorDTO;
import br.edu.raizesculturais.model.Produtor;
import br.edu.raizesculturais.repository.AvaliacaoRepository;
import br.edu.raizesculturais.repository.ParticipacaoRepository;
import br.edu.raizesculturais.repository.ProdutoRepository;
import br.edu.raizesculturais.repository.ProdutorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProdutorService {

    private final ProdutorRepository repository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final ProdutoRepository produtoRepository;
    private final ParticipacaoRepository participacaoRepository;
    private final AvaliacaoRepository avaliacaoRepository;

    // ── Listagem ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<ProdutorDTO> listarTodos() {
        List<Produtor> produtores = repository.findAll();

        // 1 query: contagem de produtos por produtor
        Map<Long, Long> contagemProdutos = new HashMap<>();
        for (Object[] row : produtoRepository.contarPorProdutor()) {
            contagemProdutos.put((Long) row[0], (Long) row[1]);
        }

        // 1 query: contagem e média de avaliações por produtor
        Map<Long, long[]> statsAvaliacoes = new HashMap<>();
        for (Object[] row : avaliacaoRepository.estatisticasPorProdutor()) {
            Long produtorId = (Long) row[0];
            long count = (Long) row[1];
            Double avg = (Double) row[2];
            statsAvaliacoes.put(produtorId, new long[]{count, avg != null ? Math.round(avg * 10) : 0});
        }

        return produtores.stream()
                .map(p -> toDTO(p, contagemProdutos, statsAvaliacoes))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProdutorDTO buscarPorId(Long id) {
        Produtor p = findOrThrow(id);
        long totalProdutos = produtoRepository.contarPorProdutorId(p.getId());
        long totalAvaliacoes = avaliacaoRepository.contarPorProdutorId(p.getId());
        Double media = avaliacaoRepository.calcularMediaPorProdutor(p.getId());
        double mediaAvaliacoes = media != null ? Math.round(media * 10.0) / 10.0 : 0.0;
        return toDTO(p, (int) totalProdutos, mediaAvaliacoes, (int) totalAvaliacoes);
    }

    // ── CRUD padrão ──────────────────────────────────────────────────────────

    public ProdutorDTO criar(ProdutorDTO dto) {
        Produtor saved = repository.save(toEntity(dto));
        return toDTO(saved, 0, 0.0, 0);
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
        Produtor saved = repository.save(p);
        return buscarPorId(saved.getId());
    }

    @Transactional
    public void deletar(Long id) {
        findOrThrow(id);
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
        return toDTO(repository.save(p), 0, 0.0, 0);
    }

    public ProdutorDTO login(LoginDTO dto) {
        Produtor p = repository.findByEmail(dto.email())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos."));
        if (!passwordEncoder.matches(dto.senha(), p.getSenha())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "E-mail ou senha incorretos.");
        }
        return buscarPorId(p.getId());
    }

    // ── Configurações ─────────────────────────────────────────────────────────

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
        Produtor saved = repository.save(p);
        return buscarPorId(saved.getId());
    }

    // ── Narrativa IA ─────────────────────────────────────────────────────────

    public ProdutorDTO atualizarNarrativa(Long id, String narrativa) {
        Produtor p = findOrThrow(id);
        p.setNarrativa(narrativa);
        return buscarPorId(repository.save(p).getId());
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    public Produtor findOrThrow(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Produtor não encontrado: " + id));
    }

    private ProdutorDTO toDTO(Produtor p, Map<Long, Long> contagemProdutos,
                               Map<Long, long[]> statsAvaliacoes) {
        long totalProdutos = contagemProdutos.getOrDefault(p.getId(), 0L);
        long[] stats = statsAvaliacoes.getOrDefault(p.getId(), new long[]{0, 0});
        long totalAvaliacoes = stats[0];
        double mediaAvaliacoes = totalAvaliacoes > 0 ? stats[1] / 10.0 : 0.0;
        return toDTO(p, (int) totalProdutos, mediaAvaliacoes, (int) totalAvaliacoes);
    }

    private ProdutorDTO toDTO(Produtor p, int totalProdutos, double mediaAvaliacoes, int totalAvaliacoes) {
        return new ProdutorDTO(
                p.getId(), p.getNome(), p.getBio(), p.getLocalidade(),
                p.getContato(), p.getFotoUrl(), p.getEmail(), p.getNarrativa(),
                p.getCpf(), p.getMunicipio(), p.getEndereco(),
                p.getAnoInicio(), p.getFotoProducaoUrl(), p.getCategoriaProd(),
                totalProdutos, mediaAvaliacoes, totalAvaliacoes);
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
