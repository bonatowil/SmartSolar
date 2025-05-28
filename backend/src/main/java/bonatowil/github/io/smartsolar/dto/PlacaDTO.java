package bonatowil.github.io.smartsolar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class PlacaDTO {
    public String descricao;
    public String marca;
    public String modelo;
    public Double dimensaoX;
    public Double dimensaoY;
    public Double dimensaoZ;
    public double preco;
    public double potencia;
    public double tolerancia;
    public double peso;
}
