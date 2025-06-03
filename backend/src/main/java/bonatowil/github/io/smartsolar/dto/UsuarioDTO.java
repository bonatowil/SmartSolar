package bonatowil.github.io.smartsolar.dto;

import lombok.Getter;

@Getter
public class UsuarioDTO {
    private String nome;
    private String email;
    private String senha;

    public UsuarioDTO(String nome, String email, String senha) {
        this.nome = nome.trim();
        this.email = email.trim();
        this.senha = senha.trim();
    }

    public void setNome(String nome) {
        this.nome = nome.trim();
    }

    public void setEmail(String email) {
        this.email = email.trim();
    }

    public void setSenha(String senha) {
        this.senha = senha.trim();
    }
}
