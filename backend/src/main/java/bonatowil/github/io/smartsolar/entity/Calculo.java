package bonatowil.github.io.smartsolar.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Calculo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long calculoId;

    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "placa_id", nullable = false)
    private Placa placa;

    @Column(nullable = false)
    private String cep = "";

    @Column(nullable = false)
    private Double quantidade = 1d;

    @Column(nullable = false)
    private Double custoInstalacao = 0d;

    @Column(nullable = false)
    private Double gastoEnergia = 0d;

    @Column(nullable = false)
    private Double areaSelecionada = 0d;

    public Calculo(Usuario usuario, Placa placa, String cep, Double quantidade, Double custoInstalacao, Double gastoEnergia, Double areaSelecionada) {
        this.usuario = usuario;
        this.placa = placa;
        this.cep = cep;
        this.quantidade = quantidade;
        this.custoInstalacao = custoInstalacao;
        this.gastoEnergia = gastoEnergia;
        this.areaSelecionada = areaSelecionada;
    }
}
