package bonatowil.github.io.smartsolar.controller;

import bonatowil.github.io.smartsolar.dto.CalculoDTO;
import bonatowil.github.io.smartsolar.dto.ROIPeriodoDTO;
import bonatowil.github.io.smartsolar.entity.Calculo;
import bonatowil.github.io.smartsolar.service.CalculoService;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URLEncoder;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Tag(name = "Cálculos", description = "Gestão dos cálculos relacionadas à instalação")
@RestController
@RequestMapping("/calculo")
public class CalculoController {
    private final CalculoService calculoService;
    public CalculoController(CalculoService calculoService) {
        this.calculoService = calculoService;
    }

    @Operation(summary = "Criar um novo cálculo")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Cálculo criado com sucesso"),
    })
    @PostMapping("/")
    public ResponseEntity<Calculo> salvar(@RequestBody CalculoDTO calculoDTO) {
        return ResponseEntity.status(HttpStatus.CREATED).body(calculoService.saveCalculo(calculoDTO));
    }

    @Operation(summary = "Recuperar um cálculo a partir do ID")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Cálculo recuperado com sucesso"),
            @ApiResponse(responseCode = "404", description = "Cálculo não encontrado", content = @Content)
    })
    @GetMapping("/{calculoId}")
    public ResponseEntity<Calculo> buscar(@PathVariable("calculoId") Long calculoId){
        Calculo calculo = calculoService.findById(calculoId);
        if (calculo == null){
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.status(HttpStatus.OK).body(calculo);
    }

    @Operation(summary = "Recuperar ROI (percentual, lucro acumulado e mês de payback) para um cálculo existente")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de ROI retornada com sucesso",
                    content = @Content(mediaType = "application/json")),
            @ApiResponse(responseCode = "204", description = "Nenhum dado disponível para cálculo (gastoEnergia ≤ 0 ou investimento inválido)",
                    content = @Content),
            @ApiResponse(responseCode = "404", description = "Cálculo não encontrado para o ID informado",
                    content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno ao processar o ROI",
                    content = @Content)
    })
    @GetMapping("/ROI/{calculoId}")
    public ResponseEntity<List<ROIPeriodoDTO>> obterROI(@PathVariable("calculoId") Long calculoId) {
        try {
            List<ROIPeriodoDTO> listaROI = calculoService.calcularROI(calculoId);
            if (listaROI.isEmpty()) {
                // Sem economia ou sem investimento: devolve 204 No Content
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.ok(listaROI);

        } catch (IllegalArgumentException ex) {
            // Cálculo não encontrado → 404
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (Exception ex) {
            // Qualquer outro erro inesperado → 500
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @Operation(summary = "Recuperar as coordenadas (latitude e longitude) com base no CEP")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Coordenadas recuperadas com sucesso"),
            @ApiResponse(responseCode = "404", description = "CEP não encontrado", content = @Content),
            @ApiResponse(responseCode = "500", description = "Erro interno ao buscar pelas coordenadas", content = @Content)
    })
    @GetMapping("/endereco")
    public ResponseEntity<Map<String, Double>> getCoordenadasPorCep(@RequestParam String cep) {
        cep = cep.replace("-", "").trim();

        if (cep.length() > 9 || !cep.matches("\\d{5}-?\\d{3}") || cep.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        try (CloseableHttpClient client = HttpClients.createDefault()) {
            String viaCepUrl = "https://viacep.com.br/ws/" + cep + "/json/";
            HttpGet viaCepRequest = new HttpGet(viaCepUrl);
            String viaCepResponse = client.execute(viaCepRequest, response -> EntityUtils.toString(response.getEntity()));

            JsonObject viaCepJson = JsonParser.parseString(viaCepResponse).getAsJsonObject();

            if (viaCepJson.has("erro")) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            String logradouro = viaCepJson.get("logradouro").getAsString();
            String bairro = viaCepJson.get("bairro").getAsString();
            String localidade = viaCepJson.get("localidade").getAsString();
            String uf = viaCepJson.get("uf").getAsString();

            String address = String.format("%s, %s, %s, %s, Brasil", logradouro, bairro, localidade, uf);

            String encodedAddress = URLEncoder.encode(address, "UTF-8");
            String nominatimUrl = "https://nominatim.openstreetmap.org/search?q=" + encodedAddress + "&format=json&limit=1";
            HttpGet nominatimRequest = new HttpGet(nominatimUrl);
            nominatimRequest.addHeader("User-Agent", "SmartSolar/1.0 (");

            String nominatimResponse = client.execute(nominatimRequest, response -> EntityUtils.toString(response.getEntity()));

            JsonArray nominatimJson = JsonParser.parseString(nominatimResponse).getAsJsonArray();

            if (nominatimJson.isEmpty()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            JsonObject locationObj = nominatimJson.get(0).getAsJsonObject();
            Map<String, Double> coordenadas = new HashMap<>();

            coordenadas.put("latitude", locationObj.get("lat").getAsDouble());
            coordenadas.put("longitude", locationObj.get("lon").getAsDouble());

            return ResponseEntity.ok(coordenadas);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
