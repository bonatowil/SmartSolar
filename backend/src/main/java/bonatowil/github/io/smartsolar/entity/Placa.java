package bonatowil.github.io.smartsolar.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Placa {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public int placaId;
    public boolean ativo;
    public String descricao;
    public String marca;
    public String modelo;
    public Double dimensaoX;
    public Double dimensaoY;
    public Double dimensaoZ;
    public double preco;
    public double area;
    public double potencia;
    public double tolerancia;
    public double peso;

    public Placa(String descricao, String marca, String modelo, Double dimensaoX, Double dimensaoY, Double dimensaoZ, double preco, double potencia, double tolerancia, double peso) {
        this.ativo = true;
        this.descricao = descricao;
        this.marca = marca;
        this.modelo = modelo;
        this.dimensaoX = dimensaoX;
        this.dimensaoY = dimensaoY;
        this.dimensaoZ = dimensaoZ;
        this.preco = preco;
        this.potencia = potencia;
        this.tolerancia = tolerancia;
        this.peso = peso;
        int uniDimensao; // Marca qual a unidade utilizada para dimensão: < 100 = m | > 100 = cm | > 1000 = mm
        if (dimensaoX > 1000)
            uniDimensao = 1000;
        else if (dimensaoX > 100)
            uniDimensao = 100;
        else
            uniDimensao = 1;

        this.area = (dimensaoX / uniDimensao) * (dimensaoY / uniDimensao);
    }
}
