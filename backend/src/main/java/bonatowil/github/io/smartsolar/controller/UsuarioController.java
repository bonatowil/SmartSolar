package bonatowil.github.io.smartsolar.controller;

import bonatowil.github.io.smartsolar.dto.UsuarioDTO;
import bonatowil.github.io.smartsolar.dto.UsuarioPublicDTO;
import bonatowil.github.io.smartsolar.entity.Usuario;
import bonatowil.github.io.smartsolar.service.UsuarioService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Collections;
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
}
