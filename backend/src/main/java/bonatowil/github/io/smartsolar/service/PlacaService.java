package bonatowil.github.io.smartsolar.service;

import bonatowil.github.io.smartsolar.dto.PlacaDTO;
import bonatowil.github.io.smartsolar.entity.Placa;
import bonatowil.github.io.smartsolar.repository.PlacaRepository;
import org.springframework.stereotype.Service;

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
                placaDTO.getTolerancia(),
                placaDTO.getPeso()
        ));
    }
}
