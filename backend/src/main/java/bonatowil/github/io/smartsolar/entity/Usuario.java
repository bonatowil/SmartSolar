package bonatowil.github.io.smartsolar.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@AllArgsConstructor
@NoArgsConstructor
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public int usuarioId;
    public String nome;
    public String email;
    public String senha;
    public LocalDateTime dataCadastro;
    public LocalDateTime dataUltimoAcesso;

    public Usuario(String nome, String email, String senha, LocalDateTime dataCadastro, LocalDateTime dataUltimoAcesso) {
        this.nome = nome;
        this.email = email;
        this.senha = senha;
        this.dataCadastro = dataCadastro;
        this.dataUltimoAcesso = dataUltimoAcesso;
    }
}
