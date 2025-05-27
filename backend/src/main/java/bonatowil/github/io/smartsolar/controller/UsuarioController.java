package bonatowil.github.io.smartsolar.controller;

import bonatowil.github.io.smartsolar.dto.UsuarioDTO;
import bonatowil.github.io.smartsolar.dto.UsuarioPublicDTO;
import bonatowil.github.io.smartsolar.entity.Usuario;
import bonatowil.github.io.smartsolar.service.UsuarioService;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.util.EntityUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/usuario")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping("/")
    public ResponseEntity<Usuario> saveUsuario(@RequestBody UsuarioDTO usuarioDTO) {
        if (usuarioDTO.getNome() == null || usuarioDTO.getNome().isEmpty() ||
            usuarioDTO.getEmail() == null || usuarioDTO.getEmail().isEmpty() ||
            usuarioDTO.getSenha() == null || usuarioDTO.getSenha().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        }
        if (usuarioService.findByEmail(usuarioDTO.getEmail()) != null) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(null);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.saveUsuario(usuarioDTO));
    }

    @GetMapping("/{usuarioId}")
    public ResponseEntity<UsuarioPublicDTO> getUsuarioById(@PathVariable int usuarioId) {
        Usuario usuario = usuarioService.findById(usuarioId);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(
            new UsuarioPublicDTO(usuario.getUsuarioId(), usuario.getNome(), usuario.getDataCadastro(), usuario.getDataUltimoAcesso())
        );
    }

    @GetMapping("/auth")
    public ResponseEntity<Map<String, Integer>> authUsuario(@RequestHeader("email") String email, @RequestHeader("senha") String senha) {
        email = email.trim();
        senha = senha.trim();
        Usuario usuario = usuarioService.findByEmail(email);
        if (usuario == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        if (!usuario.getSenha().equals(senha)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
        usuario.setDataUltimoAcesso(LocalDateTime.ofInstant(Instant.now(), ZoneId.of("America/Sao_Paulo")));

        return ResponseEntity.ok(Collections.singletonMap("usuarioId", usuario.getUsuarioId()));
    }

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
