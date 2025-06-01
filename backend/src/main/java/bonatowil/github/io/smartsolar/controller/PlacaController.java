package bonatowil.github.io.smartsolar.controller;

import bonatowil.github.io.smartsolar.dto.PlacaDTO;
import bonatowil.github.io.smartsolar.entity.Placa;
import bonatowil.github.io.smartsolar.service.PlacaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Tag(name = "Placas Solares", description = "Gestão de placas solares")
@RestController
@RequestMapping("/placa")
public class PlacaController {
    private final PlacaService placaService;

    public PlacaController(PlacaService placaService) {
        this.placaService = placaService;
    }

    @Operation(summary = "Salvar uma nova Placa")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "201", description = "Placa criada com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados da placa inválidos", content = @Content)
    })
    @PostMapping("/")
    public ResponseEntity<Placa> savePlaca(@RequestBody PlacaDTO placaDTO) {
        if (placaDTO.getDescricao() == null || placaDTO.getDescricao().isEmpty() ||
            placaDTO.getModelo() == null || placaDTO.getModelo().isEmpty() ||
            placaDTO.getMarca() == null || placaDTO.getMarca().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Descrição, modelo e marca são obrigatórios.");
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(placaService.savePlaca(placaDTO));
    }

    @Operation(summary = "Listar placas com ou sem filtro")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Lista de placas retornada com sucesso")
    })
    @GetMapping("/")
    public ResponseEntity<List<Placa>> listPlaca(
            @RequestParam(required = false, defaultValue = "") String descricao,
            @RequestParam(required = false, defaultValue = "") String marca,
            @RequestParam(required = false, defaultValue = "") String modelo) {
        List<Placa> listaPlacas;

        if (descricao.isEmpty() && marca.isEmpty() && modelo.isEmpty()) {
            listaPlacas =  placaService.findAll();
        } else {
            listaPlacas = placaService.findAllFilter(descricao, marca, modelo);
        }

        return ResponseEntity.ok(listaPlacas);
    }

    @Operation(summary = "Obter uma placa por ID")
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Placa encontrada"),
            @ApiResponse(responseCode = "404", description = "Placa não encontrada", content = @Content)
    })
    @GetMapping("/{placaId}")
    public ResponseEntity<Placa> getPlaca(@PathVariable("placaId") Long placaId) {
        Placa placa = placaService.findById(placaId);
        if (placa == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        return ResponseEntity.ok(placa);
    }
}
