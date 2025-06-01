package bonatowil.github.io.smartsolar.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ROIPeriodoDTO {
    private String periodo;
    private Double roi;
    private Double lucro;
    private Boolean payback;
}
