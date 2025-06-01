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
    private String descricao;
    private String marca;
    private String modelo;
    private Double dimensaoX;
    private Double dimensaoY;
    private Double dimensaoZ;
    private double preco;
    private double potencia;
    private double tolerancia;
    private double peso;
}
