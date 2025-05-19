package bonatowil.github.io.smartsolar.repository;

import bonatowil.github.io.smartsolar.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
}
