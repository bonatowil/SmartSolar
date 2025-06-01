package bonatowil.github.io.smartsolar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class CalculoDTO  {
    private Long usuarioId;
    private Long placaId;
    private String cep;
    private Double quantidade;
    private Double custoInstalacao;
    private Double gastoEnergia;
    private Double areaSelecionada;
}
