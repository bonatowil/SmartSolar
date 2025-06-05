// ../assets/js/calc.js

document.addEventListener('DOMContentLoaded', () => {
    // --- SELETORES DO DOM ---
    const addressInput = document.getElementById('address');
    const inputBill = document.getElementById('gasto-medio');
    const inputConsume = document.getElementById('consumo-medio');
    const inputTariff = document.getElementById('tarifa');
    const inputQntPlaca = document.getElementById('qnt-placa');
    const placaSelect = document.getElementById('placa-selecionada');
    const calculateBtn = document.getElementById('calculate-btn');
    const resultsSection = document.getElementById('results-section');
    const resultArea = document.getElementById('result-area');
    const resultPanels = document.getElementById('result-panels');
    const resultCost = document.getElementById('result-cost');
    const resultRoi = document.getElementById('result-roi');
    const chartsContainer = document.getElementById('charts-container');
    const panelPowerEl = document.getElementById('panel-power');
    const panelDimensionsEl = document.getElementById('panel-dimensions');
    const panelEfficiencyEl = document.getElementById('panel-efficiency');
    const panelDetailsPlaceholder = document.getElementById('panel-details-placeholder');
    const panelPriceEl = document.getElementById('panel-price');

    // --- VARIÁVEIS GLOBAIS ---
    const API_BASE_URL = 'http://localhost:8080';
    let todasAsPlacas = [];
    let roiChartInstance = null;

    // --- FUNÇÕES UTILITÁRIAS ---
    function recalcOnBlur(event) {
        const changedId = event.target.id;
        const billStr = inputBill.value.trim() || "";
        const consStr = inputConsume.value.trim() || "";
        const tariffStr = inputTariff.value.trim() || "";
        const billVal = parseFloat(billStr);
        const consVal = parseFloat(consStr);
        const tariffVal = parseFloat(tariffStr);
        const isBillFilled = !isNaN(billVal) && billStr !== "";
        const isConsFilled = !isNaN(consVal) && consStr !== "";
        const isTariffFilled = !isNaN(tariffVal) && tariffStr !== "";
        if (!isBillFilled && isConsFilled && isTariffFilled) {
            const resultadoBill = consVal * tariffVal;
            inputBill.value = Number.isFinite(resultadoBill) ? resultadoBill.toFixed(2) : "";
            return;
        }
        if (isBillFilled && !isConsFilled && isTariffFilled) {
            if (tariffVal !== 0) {
                const resultadoCons = billVal / tariffVal;
                inputConsume.value = Number.isFinite(resultadoCons) ? resultadoCons.toFixed(2) : "";
            } else {
                inputConsume.value = "";
            }
            return;
        }
        if (isBillFilled && isConsFilled && !isTariffFilled) {
            if (consVal !== 0) {
                const resultadoTariff = billVal / consVal;
                inputTariff.value = Number.isFinite(resultadoTariff) ? resultadoTariff.toFixed(3) : "";
            } else {
                inputTariff.value = "";
            }
            return;
        }
        if (isBillFilled && isConsFilled && isTariffFilled) {
            if (changedId === 'consumo-medio') {
                if (consVal !== 0) {
                    const novaTarifa = billVal / consVal;
                    inputTariff.value = Number.isFinite(novaTarifa) ? novaTarifa.toFixed(3) : "";
                } else {
                    inputTariff.value = "";
                }
            } else if (changedId === 'tarifa') {
                if (tariffVal !== 0) {
                    const novoConsumo = billVal / tariffVal;
                    inputConsume.value = Number.isFinite(novoConsumo) ? novoConsumo.toFixed(2) : "";
                } else {
                    inputConsume.value = "";
                }
            } else if (changedId === 'gasto-medio') {
                if (tariffVal !== 0) {
                    const novoConsumo = billVal / tariffVal;
                    inputConsume.value = Number.isFinite(novoConsumo) ? novoConsumo.toFixed(2) : "";
                } else if (consVal !== 0) {
                    const novaTarifa = billVal / consVal;
                    inputTariff.value = Number.isFinite(novaTarifa) ? novaTarifa.toFixed(3) : "";
                } else {
                    inputConsume.value = "";
                    inputTariff.value = "";
                }
            }
            return;
        }
    }
    if (inputBill && inputConsume && inputTariff) {
        [inputBill, inputConsume, inputTariff].forEach(input => {
            input.addEventListener('blur', recalcOnBlur);
        });
    }
    async function carregarPlacas() {
        if (!placaSelect) return;
        const authHeader = `Basic ${btoa(`admin:admin`)}`;
        try {
            const response = await fetch(`${API_BASE_URL}/placa/`, {
                method: 'GET',
                headers: { 'Authorization': authHeader }
            });
            if (!response.ok) throw new Error(`Erro ao buscar placas: ${response.status}`);
            const placas = await response.json();
            todasAsPlacas = placas;
            placaSelect.innerHTML = '<option value="" disabled selected>Selecione uma placa</option>';
            if (placas && placas.length > 0) {
                placas.forEach(placa => {
                    const option = document.createElement('option');
                    option.value = placa.placaId;
                    option.dataset.potencia = placa.potencia || '0';
                    option.dataset.dimensoes = `${placa.dimensaoX} x ${placa.dimensaoY} x ${placa.dimensaoZ} mm`;
                    option.dataset.eficiencia = placa.eficiencia || '0';
                    option.dataset.preco = placa.preco || '0';
                    option.textContent = `${placa.marca || 'Marca'} ${placa.modelo || 'Modelo'} - ${placa.potencia || 'N/A'}W`;
                    placaSelect.appendChild(option);
                });
            } else {
                placaSelect.innerHTML = '<option value="" disabled selected>Nenhuma placa disponível</option>';
            }
        } catch (error) {
            console.error('Falha ao carregar placas:', error);
            placaSelect.innerHTML = '<option value="" disabled selected>Erro ao carregar placas</option>';
        }
        atualizarDetalhesPlaca();
    }
    function atualizarDetalhesPlaca() {
        const selectedOption = placaSelect.options[placaSelect.selectedIndex];
        if (!panelPowerEl || !panelDimensionsEl || !panelEfficiencyEl || !panelDetailsPlaceholder || !panelPriceEl) return;
        const setCalculateButtonState = (enabled) => {
            if (!calculateBtn) return;
            calculateBtn.disabled = !enabled;
            if (enabled) {
                calculateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            } else {
                calculateBtn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        };
        if (placaSelect.value && selectedOption.value !== "") {
            const eficienciaPercentual = parseFloat(selectedOption.dataset.eficiencia) * 100;
            const precoPlaca = parseFloat(selectedOption.dataset.preco || '0');
            panelPowerEl.textContent = `${selectedOption.dataset.potencia || '--'} W`;
            panelDimensionsEl.textContent = selectedOption.dataset.dimensoes || '--';
            panelEfficiencyEl.textContent = `${eficienciaPercentual.toFixed(2) || '--'} %`;
            panelPriceEl.textContent = `R$ ${precoPlaca.toFixed(2).replace('.', ',')}`;
            panelDetailsPlaceholder.style.display = 'none';
            if (precoPlaca > 0) {
                setCalculateButtonState(true);
            } else {
                setCalculateButtonState(false);
                showAppToast('Esta placa não tem preço cadastrado e não pode ser calculada.', 'warning', 4000);
            }
        } else {
            setCalculateButtonState(false);
            panelPowerEl.textContent = '-- W';
            panelDimensionsEl.textContent = '--';
            panelEfficiencyEl.textContent = '-- %';
            panelPriceEl.textContent = 'R$ --';
            panelDetailsPlaceholder.style.display = 'block';
        }
    }
    if (placaSelect) {
        carregarPlacas();
        placaSelect.addEventListener('change', atualizarDetalhesPlaca);
    }

    // --- FUNÇÕES DE ESTILO DO GRÁFICO ---
    const isDarkMode = () => document.documentElement.classList.contains('dark');
    const getTextColor = () => isDarkMode() ? 'rgba(229, 231, 235, 1)' : 'rgba(55, 65, 81, 1)';
    const getGridColor = () => isDarkMode() ? 'rgba(75, 85, 99, 0.4)' : 'rgba(209, 213, 219, 0.6)';
    const getTooltipBackgroundColor = () => isDarkMode() ? 'rgba(31, 41, 55, 0.85)' : 'rgba(255, 255, 255, 0.85)';

    const chartAreaBackgroundColorPlugin = {
        id: 'chartAreaBackgroundColor',
        beforeDraw(chart, args, options) {
            const { ctx, chartArea: { top, left, width, height } } = chart;
            ctx.save();
            ctx.fillStyle = options.color || (isDarkMode() ? 'rgba(55, 65, 81, 0.3)' : 'rgba(249, 250, 251, 1)');
            const cornerRadius = options.cornerRadius || 8;
            ctx.beginPath();
            ctx.moveTo(left + cornerRadius, top);
            ctx.lineTo(left + width - cornerRadius, top);
            ctx.quadraticCurveTo(left + width, top, left + width, top + cornerRadius);
            ctx.lineTo(left + width, top + height - cornerRadius);
            ctx.quadraticCurveTo(left + width, top + height, left + width - cornerRadius, top + height);
            ctx.lineTo(left + cornerRadius, top + height);
            ctx.quadraticCurveTo(left, top + height, left, top + height - cornerRadius);
            ctx.lineTo(left, top + cornerRadius);
            ctx.quadraticCurveTo(left, top, left + cornerRadius, top);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    };

    function renderROIGraph(labels, lucroData, paybackPeriod, paybackAchieved, custoInicial) {
        if (!chartsContainer) return;
        if (roiChartInstance) roiChartInstance.destroy();

        chartsContainer.innerHTML = '<canvas id="roiChartCanvas"></canvas>';
        const ctx = document.getElementById('roiChartCanvas').getContext('2d');

        const paybackIndex = paybackAchieved ? labels.indexOf(paybackPeriod) : -1;

        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, isDarkMode() ? 'rgba(34, 197, 94, 0.4)' : 'rgba(34, 197, 94, 0.5)');
        gradient.addColorStop(1, 'rgba(34, 197, 94, 0.05)');

        const pointBackgroundColors = lucroData.map((_, index) => {
            if (index === 0) return 'rgba(239, 68, 68, 1)'; // Ponto inicial (custo) em vermelho
            if (paybackAchieved && index === paybackIndex) return 'rgba(250, 204, 21, 1)'; // Ponto de payback em dourado
            return 'rgba(22, 163, 74, 1)';
        });
        const pointRadius = labels.map((_, index) => (paybackAchieved && index === paybackIndex) || index === 0 ? 7 : 4);

        roiChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Lucro Acumulado',
                    data: lucroData,
                    borderColor: 'rgba(22, 163, 74, 1)',
                    backgroundColor: gradient,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: pointBackgroundColors,
                    pointBorderColor: 'rgba(255, 255, 255, 0.8)',
                    pointBorderWidth: 1.5,
                    pointRadius: pointRadius,
                    pointHoverRadius: (context) => pointRadius[context.dataIndex] * 1.5,
                    pointHoverBorderWidth: 2,
                }]
            },
            // ** CÓDIGO COMPLETO DAS OPÇÕES DO GRÁFICO **
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Período',
                            color: getTextColor(),
                            font: {
                                weight: '600',
                                size: 14
                            }
                        },
                        ticks: {
                            color: getTextColor()
                        },
                        grid: {
                            color: getGridColor(),
                            borderDash: [3, 5]
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Lucro Acumulado (R$)',
                            color: getTextColor(),
                            font: {
                                weight: '600',
                                size: 14
                            }
                        },
                        ticks: {
                            callback: (value) => 'R$ ' + value.toLocaleString('pt-BR'),
                            color: getTextColor(),
                        },
                        grid: {
                            color: getGridColor()
                        }
                    }
                },
                plugins: {
                    chartAreaBackgroundColor: {
                        cornerRadius: 8
                    },
                    annotation: {
                        annotations: {
                            line1: {
                                type: 'line',
                                yMin: 0,
                                yMax: 0,
                                borderColor: isDarkMode() ? 'rgba(251, 146, 60, 0.6)' : 'rgba(239, 68, 68, 0.6)',
                                borderWidth: 2,
                                borderDash: [6, 6],
                                label: {
                                    content: 'Custo Inicial',
                                    position: 'start',
                                    backgroundColor: 'rgba(0,0,0,0)',
                                    color: isDarkMode() ? 'rgba(251, 146, 60, 0.9)' : 'rgba(239, 68, 68, 0.9)',
                                    font: {
                                        weight: 'bold'
                                    },
                                    yAdjust: -12
                                }
                            }
                        }
                    },
                    tooltip: {
                        enabled: true,
                        backgroundColor: getTooltipBackgroundColor(),
                        titleColor: getTextColor(),
                        bodyColor: getTextColor(),
                        borderColor: getGridColor(),
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        usePointStyle: true,
                        callbacks: {
                            label: (context) => {
                                let label = ` ${context.dataset.label || ''}`;
                                if (label) label += ': ';
                                label += 'R$ ' + context.parsed.y.toLocaleString('pt-BR', {
                                    minimumFractionDigits: 2,
                                    maximumFractionDigits: 2
                                });
                                if (paybackAchieved && context.dataIndex === paybackIndex) {
                                    label += ' (PAYBACK)';
                                }
                                if (context.dataIndex === 0) {
                                    label += ' (Custo)';
                                }
                                return label;
                            }
                        }
                    },
                    legend: {
                        display: false
                    },
                    title: {
                        display: true,
                        text: 'Projeção de Retorno do Investimento (ROI)',
                        color: getTextColor(),
                        font: {
                            size: 18,
                            weight: 'bold'
                        },
                        padding: {
                            top: 10,
                            bottom: 30
                        }
                    }
                },
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                elements: {
                    line: {
                        borderWidth: 3
                    }
                }
            },
            plugins: [chartAreaBackgroundColorPlugin]
        });
    }

    // --- LÓGICA DO BOTÃO "CALCULAR" ---
    if (calculateBtn) {
        calculateBtn.addEventListener('click', async () => {
            const originalButtonHTML = calculateBtn.innerHTML;
            calculateBtn.disabled = true;
            calculateBtn.innerHTML = `<svg class="animate-spin h-5 w-5 mr-3 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Calculando...`;

            try {
                // ETAPA 1: Coleta e validação de dados
                const consumoEnergiaMensalKwh = parseFloat(inputConsume.value.replace(',', '.'));
                const gastoMedioMensal = parseFloat(inputBill.value.replace(',', '.')) || 0;
                const areaSelecionadaM2 = parseFloat(localStorage.getItem('areaDesenhada'));
                const mediaIrradiacaoDiaria = parseFloat(localStorage.getItem('mediaIrradiacaoEstado'));
                const selectedPlacaId = placaSelect.value;
                const usuarioIdVal = localStorage.getItem('usuarioId');

                if (!usuarioIdVal) throw new Error('ID do usuário não encontrado. Faça login novamente.');
                if (!selectedPlacaId) throw new Error('Por favor, selecione uma placa solar.');
                if (gastoMedioMensal <= 0) throw new Error('O "Gasto Médio Mensal (R$)" deve ser maior que zero para calcular o ROI.');
                if (isNaN(areaSelecionadaM2) || areaSelecionadaM2 <= 0) throw new Error('Desenhe uma área válida no mapa.');
                if (isNaN(consumoEnergiaMensalKwh) || consumoEnergiaMensalKwh <= 0) throw new Error('Informe um consumo mensal válido.');
                if (isNaN(mediaIrradiacaoDiaria) || mediaIrradiacaoDiaria <= 0) throw new Error('Valor de irradiação para o estado não encontrado. Busque um endereço no mapa.');

                // ETAPA 2: Cálculo da quantidade de painéis
                const placaSelecionada = todasAsPlacas.find(p => p.placaId == selectedPlacaId);
                if (!placaSelecionada) throw new Error('Detalhes da placa selecionada não encontrados.');

                const areaPainelM2 = (parseFloat(placaSelecionada.dimensaoX) || 0) / 1000 * (parseFloat(placaSelecionada.dimensaoY) || 0) / 1000;
                const eficienciaPainel = parseFloat(placaSelecionada.eficiencia) || 0;
                const potenciaPainelW = parseFloat(placaSelecionada.potencia) || 0;
                const precoUnitarioPlaca = parseFloat(placaSelecionada.preco) || 0;

                if (areaPainelM2 <= 0 || eficienciaPainel <= 0 || potenciaPainelW <= 0) throw new Error('A placa selecionada tem dados (dimensão, eficiência ou potência) inválidos.');
                if (precoUnitarioPlaca <= 0) throw new Error(`A placa "${placaSelecionada.modelo || 'selecionada'}" está sem preço. Verifique o cadastro.`);

                const consumoAnualKwh = consumoEnergiaMensalKwh * 12;
                const fatorPerdasSistema = 0.85;
                const energiaGeradaPorPainelAnual = mediaIrradiacaoDiaria * areaPainelM2 * eficienciaPainel * 365 * fatorPerdasSistema;
                if (energiaGeradaPorPainelAnual <= 0) throw new Error('Cálculo de geração por painel resultou em valor inválido.');

                const paineisNecessariosPorEnergia = Math.ceil(consumoAnualKwh / energiaGeradaPorPainelAnual);
                const paineisMaximosPorArea = Math.floor(areaSelecionadaM2 / areaPainelM2);
                const quantidadeFinal = Math.min(paineisNecessariosPorEnergia, paineisMaximosPorArea);

                if (quantidadeFinal < 1) throw new Error(`A área selecionada (${areaSelecionadaM2.toFixed(2)} m²) é muito pequena para a placa escolhida.`);
                if (paineisMaximosPorArea < paineisNecessariosPorEnergia) {
                    showAppToast(`Aviso: O telhado comporta ${paineisMaximosPorArea} painéis. Para cobrir seu consumo, seriam necessários ${paineisNecessariosPorEnergia}.`, 'warning', 8000);
                }
                inputQntPlaca.value = quantidadeFinal;

                // ETAPA 3: CÁLCULO TOTAL DO CUSTO NO FRONTEND
                const CUSTO_INSTALACAO_POR_WATT = 3.00;
                const custoTotalPlacas = precoUnitarioPlaca * quantidadeFinal;
                const potenciaTotalWp = potenciaPainelW * quantidadeFinal;
                const custoInstalacaoEstimado = potenciaTotalWp * CUSTO_INSTALACAO_POR_WATT;
                const custoInicial = custoTotalPlacas + custoInstalacaoEstimado;

                // ETAPA 4: Chamada ao backend (sem alterar)
                const calculoData = {
                    usuarioId: parseInt(usuarioIdVal, 10),
                    placaId: parseInt(selectedPlacaId, 10),
                    cep: addressInput.value.trim(),
                    quantidade: quantidadeFinal,
                    custoInstalacao: custoInicial,
                    gastoEnergia: gastoMedioMensal,
                    areaSelecionada: areaSelecionadaM2
                };
                const authHeader = `Basic ${btoa(`admin:admin`)}`;
                const responseCalculo = await fetch(`${API_BASE_URL}/calculo/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
                    body: JSON.stringify(calculoData)
                });
                if (!responseCalculo.ok) {
                    const errorData = await responseCalculo.json().catch(() => ({ message: 'Erro desconhecido.' }));
                    throw new Error(errorData.message || `Falha na simulação (Status: ${responseCalculo.status})`);
                }
                const calculoCriado = await responseCalculo.json();

                // ETAPA 5: Exibe resultados e prepara dados de ROI com o custo do frontend
                resultsSection.style.display = 'block';
                if (resultArea) resultArea.textContent = `${areaSelecionadaM2.toFixed(2)} m²`;
                if (resultPanels) resultPanels.textContent = quantidadeFinal;
                if (resultCost) resultCost.textContent = `R$ ${custoInicial.toFixed(2).replace('.', ',')}`;
                resultsSection.scrollIntoView({ behavior: 'smooth' });

                const roiResponse = await fetch(`${API_BASE_URL}/calculo/ROI/${calculoCriado.calculoId}`, {
                    method: 'GET',
                    headers: { 'Authorization': authHeader }
                });
                if (!roiResponse.ok) throw new Error(`Falha ao buscar dados de ROI (Status: ${roiResponse.status})`);

                const roiDataAPI = await roiResponse.json();
                let paybackPeriod = "Não alcançado";
                let paybackAchieved = false;
                const labels = ['Início'];
                const lucroData = [-custoInicial];

                if (roiDataAPI && roiDataAPI.length > 0) {
                    roiDataAPI.forEach(item => {
                        labels.push(item.periodo);
                        lucroData.push(item.lucro);
                        if (item.payback && !paybackAchieved) {
                            paybackPeriod = item.periodo;
                            paybackAchieved = true;
                        }
                    });
                }

                if (resultRoi) {
                    resultRoi.innerHTML = paybackAchieved ?
                        `<span class="text-green-500 dark:text-green-400">${paybackPeriod}</span>` :
                        `<span class="text-red-500 dark:text-red-400">${paybackPeriod}</span>`;
                }

                if (labels.length > 1 && lucroData.length > 1 && !isNaN(custoInicial)) {
                    renderROIGraph(labels, lucroData, paybackPeriod, paybackAchieved, custoInicial);
                } else {
                    chartsContainer.innerHTML = `<p class="text-center text-gray-500 dark:text-gray-400">Dados insuficientes para gerar a projeção de ROI.</p>`;
                }

            } catch (error) {
                showAppToast(`Erro: ${error.message}`, 'error', 7000);
                console.error("Erro detalhado:", error);
                if (resultsSection) resultsSection.style.display = 'none';
            } finally {
                calculateBtn.disabled = false;
                calculateBtn.classList.remove('opacity-50', 'cursor-not-allowed');
                calculateBtn.innerHTML = originalButtonHTML;
            }
        });
    }
});