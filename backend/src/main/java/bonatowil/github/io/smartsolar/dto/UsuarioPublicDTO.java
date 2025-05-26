package bonatowil.github.io.smartsolar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
public class UsuarioPublicDTO {
    public int usuarioId;
    public String nome;
    public LocalDateTime dataCadastro;
    public LocalDateTime dataUltimoAcesso;
}
