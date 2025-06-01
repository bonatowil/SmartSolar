package bonatowil.github.io.smartsolar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDateTime;

@AllArgsConstructor
@Getter
public class UsuarioPublicDTO {
    private int usuarioId;
    private String nome;
    private LocalDateTime dataCadastro;
    private LocalDateTime dataUltimoAcesso;
}
