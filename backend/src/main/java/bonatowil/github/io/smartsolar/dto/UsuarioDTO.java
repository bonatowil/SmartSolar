package bonatowil.github.io.smartsolar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class UsuarioDTO {
    public String nome;
    public String email;
    public String senha;
}
