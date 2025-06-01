package bonatowil.github.io.smartsolar.service;

import bonatowil.github.io.smartsolar.config.ResourceNotFoundException;
import bonatowil.github.io.smartsolar.dto.CalculoDTO;
import bonatowil.github.io.smartsolar.dto.ROIPeriodoDTO;
import bonatowil.github.io.smartsolar.entity.Calculo;
import bonatowil.github.io.smartsolar.entity.Placa;
import bonatowil.github.io.smartsolar.entity.Usuario;
import bonatowil.github.io.smartsolar.repository.CalculoRepository;
import bonatowil.github.io.smartsolar.repository.PlacaRepository;
import bonatowil.github.io.smartsolar.repository.UsuarioRepository;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class CalculoService {
    private final CalculoRepository calculoRepository;
    private final PlacaRepository placaRepository;
    private final UsuarioRepository usuarioRepository;

    public CalculoService(CalculoRepository calculoRepository, PlacaRepository placaRepository, UsuarioRepository usuarioRepository) {
        this.calculoRepository = calculoRepository;
        this.placaRepository = placaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Calculo saveCalculo(CalculoDTO calculoDTO) {
        Usuario usuario = usuarioRepository.findById(calculoDTO.getUsuarioId()).orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado"));
        Placa placa = placaRepository.findById(calculoDTO.getPlacaId()).orElseThrow(() -> new ResourceNotFoundException("Placa não encontrada"));
        return calculoRepository.save(new Calculo(
                usuario,
                placa,
                calculoDTO.getCep(),
                calculoDTO.getQuantidade(),
                calculoDTO.getCustoInstalacao(),
                calculoDTO.getGastoEnergia(),
                calculoDTO.getAreaSelecionada()
        ));
    }

    public Calculo findById(Long calculoId) {
        return  calculoRepository.findById(calculoId).orElse(null);
    }

    public List<ROIPeriodoDTO> calcularROI(Long calculoId) {
        Optional<Calculo> opt = calculoRepository.findById(calculoId);
        if (opt.isEmpty()) {
            throw new IllegalArgumentException("Cálculo não encontrado para o ID " + calculoId);
        }
        Calculo calculo = opt.get();

        // Extrai valores
        Placa placa = calculo.getPlaca();
        double quantidade = calculo.getQuantidade() == null ? 1.0 : calculo.getQuantidade();
        double precoUnitario = placa.getPreco();
        double custoInstalacao = calculo.getCustoInstalacao() == null ? 0.0 : calculo.getCustoInstalacao();
        double gastoEnergiaMensal = calculo.getGastoEnergia() == null ? 0.0 : calculo.getGastoEnergia();

        // Se não há economia (≤ 0), retorna lista vazia
        if (gastoEnergiaMensal <= 0.0) {
            return List.of();
        }

        // Calcular investimento total
        double investimentoTotal = custoInstalacao + (precoUnitario * quantidade);
        if (investimentoTotal <= 0.0) {
            return List.of();
        }

        // Meses até payback (ROI >= 100%):
        // mesesParaPayback = ceil(investimentoTotal / gastoEnergiaMensal)
        int mesesParaPayback = (int) Math.ceil(investimentoTotal / gastoEnergiaMensal);

        // Vamos projetar até (mesesParaPayback + 12) meses no total
        int mesesTotais = mesesParaPayback + 12;

        YearMonth inicio = YearMonth.now();
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MM/yyyy");

        List<ROIPeriodoDTO> lista = new ArrayList<>();
        boolean marcouPayback = false;

        for (int m = 1; m <= mesesTotais; m++) {
            YearMonth mesAtual = inicio.plusMonths(m);
            double economiaAcumulada = gastoEnergiaMensal * m;
            double roiAcumulado = economiaAcumulada / investimentoTotal * 100.0;
            double lucroAcumulado = economiaAcumulada - investimentoTotal;

            // Limita ROI a, no máximo, algum valor razoável (não precisa cortar, mas evita ruídos muito altos)
            // Se quiser deixar crescer indefinidamente, basta remover esse if.
            if (roiAcumulado > 200.0) {
                // por exemplo, não queremos mostrar além de 200% de ROI
                roiAcumulado = 200.0;
            }

            // Identifica o mês exato de payback (ROI ≥ 100% pela primeira vez)
            boolean isPaybackMes = false;
            if (!marcouPayback && roiAcumulado >= 100.0) {
                isPaybackMes = true;
                marcouPayback = true;
            }

            String periodoFormatado = mesAtual.format(fmt);
            ROIPeriodoDTO ponto = new ROIPeriodoDTO(periodoFormatado, roiAcumulado, lucroAcumulado, isPaybackMes);
            lista.add(ponto);
        }

        return lista;
    }
}
