package bonatowil.github.io.smartsolar.service;

import bonatowil.github.io.smartsolar.dto.PlacaDTO;
import bonatowil.github.io.smartsolar.entity.Placa;
import bonatowil.github.io.smartsolar.repository.PlacaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;
import java.util.OptionalInt;

@Service
public class PlacaService {
    private final PlacaRepository placaRepository;

    public PlacaService(PlacaRepository placaRepository) {
        this.placaRepository = placaRepository;
    }

    public Placa savePlaca(PlacaDTO placaDTO) {
        return placaRepository.save(new  Placa(
                placaDTO.getDescricao(),
                placaDTO.getMarca(),
                placaDTO.getModelo(),
                placaDTO.getDimensaoX(),
                placaDTO.getDimensaoY(),
                placaDTO.getDimensaoZ(),
                placaDTO.getPreco(),
                placaDTO.getPotencia(),
                placaDTO.getEficiencia()
        ));
    }

    public List<Placa> findAll() {
        return placaRepository.findAll();
    }

    public List<Placa> findAllFilter(String descricao, String marca, String modelo) {
        return placaRepository.findAllFilter(descricao, marca, modelo);
    }

    public Placa findById(Long placaId) {
        return placaRepository.findById(placaId).orElse(null);
    }

    public void deletePlaca(Long placaId) {
        if (!placaRepository.existsById(placaId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Placa não encontrada");
        }
        placaRepository.deleteById(placaId);
    }

    public Placa updatePlaca(Long placaId, PlacaDTO placaDTO) {
        return placaRepository.findById(placaId).map(placa -> {
            placa.setDescricao(placaDTO.getDescricao());
            placa.setMarca(placaDTO.getMarca());
            placa.setModelo(placaDTO.getModelo());
            placa.setDimensaoX(placaDTO.getDimensaoX());
            placa.setDimensaoY(placaDTO.getDimensaoY());
            placa.setDimensaoZ(placaDTO.getDimensaoZ());
            placa.setPreco(placaDTO.getPreco());
            placa.setPotencia(placaDTO.getPotencia());
            placa.setEficiencia(placaDTO.getEficiencia());

            double x = placaDTO.getDimensaoX();
            double y = placaDTO.getDimensaoY();
            int unidade;
            if (x > 1000) {
                unidade = 1000;
            } else if (x > 100) {
                unidade = 100;
            } else {
                unidade = 1;
            }
            placa.setArea((x / unidade) * (y / unidade));

            return placaRepository.save(placa);
        }).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Placa não encontrada"));
    }
}
