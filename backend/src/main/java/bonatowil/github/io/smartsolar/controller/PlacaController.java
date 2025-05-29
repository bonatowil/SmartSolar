package bonatowil.github.io.smartsolar.controller;

import bonatowil.github.io.smartsolar.dto.PlacaDTO;
import bonatowil.github.io.smartsolar.entity.Placa;
import bonatowil.github.io.smartsolar.service.PlacaService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    @GetMapping("/")
    public ResponseEntity<List<PlacaDTO>> listPlaca(@RequestParam String descricao, @RequestParam String marca, @RequestParam String modelo) {
        List<PlacaDTO> listaPlacasDTO = new java.util.ArrayList<>(List.of());
        List<Placa> listaPlacas;

        if (descricao.isEmpty() && marca.isEmpty() && modelo.isEmpty()) {
            listaPlacas =  placaService.findAll();
        } else {
            listaPlacas = placaService.findAllFilter(descricao, marca, modelo);
        }

        for (Placa placa : listaPlacas) {
            listaPlacasDTO.add(
                    new PlacaDTO(
                            placa.getDescricao(),
                            placa.getMarca(),
                            placa.getModelo(),
                            placa.getDimensaoX(),
                            placa.getDimensaoY(),
                            placa.getDimensaoZ(),
                            placa.getPreco(),
                            placa.getPotencia(),
                            placa.getTolerancia(),
                            placa.getPeso()
                    )
            );
        }
        return ResponseEntity.ok(listaPlacasDTO);
    }

    @GetMapping("/{placaId}")
    public ResponseEntity<PlacaDTO> getPlaca(@PathVariable("placaId") Long placaId) {
        Placa placa = placaService.findById(placaId);
        if (placa == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(
                new PlacaDTO(
                        placa.getDescricao(),
                        placa.getMarca(),
                        placa.getModelo(),
                        placa.getDimensaoX(),
                        placa.getDimensaoY(),
                        placa.getDimensaoZ(),
                        placa.getPreco(),
                        placa.getPotencia(),
                        placa.getTolerancia(),
                        placa.getPeso()
                )
        );
    }
}
