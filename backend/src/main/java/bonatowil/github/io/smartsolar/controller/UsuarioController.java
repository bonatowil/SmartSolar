package bonatowil.github.io.smartsolar.controller;

import bonatowil.github.io.smartsolar.dto.UsuarioDTO;
import bonatowil.github.io.smartsolar.dto.UsuarioPublicDTO;
import bonatowil.github.io.smartsolar.entity.Usuario;
import bonatowil.github.io.smartsolar.service.UsuarioService;
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
        RestTemplate restTemplate = new RestTemplate();

        try {
            // 1. Consulta ViaCEP
            String viaCepUrl = "https://viacep.com.br/ws/" + cep + "/json/";
            Map<String, Object> viaCepResponse = restTemplate.getForObject(viaCepUrl, Map.class);

            if (viaCepResponse == null || viaCepResponse.containsKey("erro")) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }

            // 2. Montar endereço completo
            String logradouro = (String) viaCepResponse.get("logradouro");
            String bairro = (String) viaCepResponse.get("bairro");
            String localidade = (String) viaCepResponse.get("localidade");
            String uf = (String) viaCepResponse.get("uf");

            String enderecoCompleto = String.format("%s, %s, %s, %s, Brasil",
                    logradouro, bairro, localidade, uf);

            // 3. Consulta Nominatim
            String nominatimUrl = "https://nominatim.openstreetmap.org/search?format=json&q="
                    + URLEncoder.encode(enderecoCompleto, StandardCharsets.UTF_8);

            System.out.println(nominatimUrl);

            // Nominatim retorna um array de objetos
            var responseEntity = restTemplate.getForEntity(nominatimUrl, Map.class);
            Object[] nominatimResponse = responseEntity.get("lat");

            System.out.println(Arrays.toString(nominatimResponse));

            if (nominatimResponse == null || nominatimResponse.length == 0) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            // Extrair lat e lon do primeiro resultado
            Map<String, Double> coordenadas = new HashMap<>();
            Map<String, Object> firstResult = (Map<String, Object>) nominatimResponse[0];
            coordenadas.put("lat", Double.parseDouble((String) firstResult.get("lat")));
            coordenadas.put("lng", Double.parseDouble((String) firstResult.get("lon")));

            return ResponseEntity.ok(coordenadas);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
