package br.edu.raizesculturais.service;

import br.edu.raizesculturais.dto.ProdutoDTO;
import br.edu.raizesculturais.model.Produto;
import br.edu.raizesculturais.model.Produtor;
import br.edu.raizesculturais.repository.ProdutoRepository;
import br.edu.raizesculturais.repository.ProdutorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProdutoService {

    private final ProdutoRepository produtoRepository;
    private final ProdutorRepository produtorRepository;

    public List<ProdutoDTO> listarPorProdutor(Long produtorId) {
        return produtoRepository.findByProdutorId(produtorId)
                .stream().map(this::toDTO).toList();
    }

    public Map<Long, Long> contagemPorProdutor() {
        Map<Long, Long> map = new HashMap<>();
        for (Object[] row : produtoRepository.contarPorProdutor()) {
            map.put((Long) row[0], (Long) row[1]);
        }
        return map;
    }

    public ProdutoDTO criar(ProdutoDTO dto) {
        Produtor produtor = produtorRepository.findById(dto.produtorId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produtor não encontrado."));
        Produto p = Produto.builder()
                .nome(dto.nome())
                .quantidade(dto.quantidade())
                .descricao(dto.descricao())
                .contato(dto.contato())
                .categoria(dto.categoria())
                .preco(dto.preco())
                .fotoUrl(dto.fotoUrl())
                .produtor(produtor)
                .build();
        return toDTO(produtoRepository.save(p));
    }

    public ProdutoDTO atualizar(Long id, ProdutoDTO dto) {
        Produto p = findOrThrow(id);
        p.setNome(dto.nome());
        p.setQuantidade(dto.quantidade());
        p.setDescricao(dto.descricao());
        p.setContato(dto.contato());
        p.setCategoria(dto.categoria());
        p.setPreco(dto.preco());
        p.setFotoUrl(dto.fotoUrl());
        return toDTO(produtoRepository.save(p));
    }

    public void deletar(Long id) {
        findOrThrow(id);
        produtoRepository.deleteById(id);
    }

    private Produto findOrThrow(Long id) {
        return produtoRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Produto não encontrado."));
    }

    private ProdutoDTO toDTO(Produto p) {
        return new ProdutoDTO(p.getId(), p.getNome(), p.getQuantidade(),
                p.getDescricao(), p.getContato(), p.getCategoria(),
                p.getProdutor().getId(), p.getPreco(), p.getFotoUrl());
    }
}
