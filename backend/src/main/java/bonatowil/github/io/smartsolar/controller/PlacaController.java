package bonatowil.github.io.smartsolar.controller;

import bonatowil.github.io.smartsolar.dto.PlacaDTO;
import bonatowil.github.io.smartsolar.entity.Placa;
import bonatowil.github.io.smartsolar.service.PlacaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/placa")
public class PlacaController {
    private final PlacaService placaService;

    public PlacaController(PlacaService placaService) {
        this.placaService = placaService;
    }

    @PostMapping("/")
    public ResponseEntity<Placa> savePlaca(@RequestBody PlacaDTO placaDTO) {
        if (placaDTO.getDescricao() == null || placaDTO.getDescricao().isEmpty() ||
            placaDTO.getModelo() == null || placaDTO.getModelo().isEmpty() ||
            placaDTO.getMarca() == null || placaDTO.getMarca().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(placaService.savePlaca(placaDTO));
    }


}
