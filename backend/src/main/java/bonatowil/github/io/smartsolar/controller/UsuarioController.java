package bonatowil.github.io.smartsolar.controller;

import bonatowil.github.io.smartsolar.dto.UsuarioDTO;
import bonatowil.github.io.smartsolar.dto.UsuarioPublicDTO;
import bonatowil.github.io.smartsolar.entity.Usuario;
import bonatowil.github.io.smartsolar.service.UsuarioService;
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
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Tag(name = "Usuários", description = "Gestão de usuários")
@RestController
@RequestMapping("/usuario")
public class UsuarioController {
    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @Operation(summary = "Criar um novo usuário")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Usuário criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados do usuário inválidos", content = @Content),
            @ApiResponse(responseCode = "409", description = "Email já cadastrado", content = @Content)
    })
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

    @Operation(summary = "Obter usuário público por ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Usuário encontrado"),
            @ApiResponse(responseCode = "404", description = "Usuário não encontrado", content = @Content)
    })
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

    @Operation(summary = "Autenticar usuário")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Autenticação bem-sucedida"),
            @ApiResponse(responseCode = "404", description = "Email não cadastrado", content = @Content),
            @ApiResponse(responseCode = "401", description = "Senha incorreta", content = @Content)
    })
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
}
