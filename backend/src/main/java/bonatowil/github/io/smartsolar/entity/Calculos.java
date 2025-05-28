package bonatowil.github.io.smartsolar.entity;

import jakarta.persistence.*;

@Entity
public class Calculos {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(nullable = false)
    private Long calculoId;
    @Column(nullable = false)
    public Long usuarioId;
    @Column(nullable = false)
    public Long placaId;
    @Column(nullable = false)
    public String cep;
    @Column(nullable = false)
    public Double quantidade;
    @Column(nullable = false)
    public Double custoInstalacao;
    @Column(nullable = false)
    public Double gastoEnergia;
    public int areaSelecionada;
}
