package bonatowil.github.io.smartsolar.service;

import bonatowil.github.io.smartsolar.entity.Usuario;
import bonatowil.github.io.smartsolar.dto.UsuarioDTO;
import bonatowil.github.io.smartsolar.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;

@Service
public class UsuarioService {
    private final UsuarioRepository usuarioRepository;

    public UsuarioService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario saveUsuario(UsuarioDTO usuarioDTO) {
        Usuario usuario = new Usuario(usuarioDTO.getNome(),
                                      usuarioDTO.getEmail(),
                                      usuarioDTO.getSenha(),
                                      LocalDateTime.ofInstant(Instant.now(), ZoneId.of("America/Sao_Paulo")),
                                      LocalDateTime.ofInstant(Instant.now(), ZoneId.of("America/Sao_Paulo")));
        return usuarioRepository.save(usuario);
    }

    public Usuario findById(int usuarioId) {
        return usuarioRepository.findById((long) usuarioId).orElse(null);
    }

    public Usuario findByEmail(String email) {
        return usuarioRepository.findByEmail(email);
    }
}
