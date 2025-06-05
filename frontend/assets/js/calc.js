// ../assets/js/calc.js

document.addEventListener('DOMContentLoaded', () => {
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

    const API_BASE_URL = 'http://localhost:8080';
    let todasAsPlacas = [];
    let roiChartInstance = null; // Agora armazenará a instância do ApexCharts

    function recalcOnBlur(event) {
        const changedId = event.target.id;
        const billStr   = inputBill.value.trim()     || "";
        const consStr   = inputConsume.value.trim()  || "";
        const tariffStr = inputTariff.value.trim()   || "";

        const billVal   = parseFloat(billStr);
        const consVal   = parseFloat(consStr);
        const tariffVal = parseFloat(tariffStr);

        const isBillFilled   = !isNaN(billVal)   && billStr   !== "";
        const isConsFilled   = !isNaN(consVal)   && consStr   !== "";
        const isTariffFilled = !isNaN(tariffVal) && tariffStr !== "";

        if (!isBillFilled && isConsFilled && isTariffFilled) {
            // falta GASTO → G = C * T
            const resultadoBill = consVal * tariffVal;
            inputBill.value = Number.isFinite(resultadoBill)
                ? resultadoBill.toFixed(2)
                : "";
            return;
        }
        if (isBillFilled && !isConsFilled && isTariffFilled) {
            // falta CONSUMO → C = G / T
            if (tariffVal !== 0) {
                const resultadoCons = billVal / tariffVal;
                inputConsume.value = Number.isFinite(resultadoCons)
                    ? resultadoCons.toFixed(2)
                    : "";
            } else {
                inputConsume.value = "";
            }
            return;
        }
        if (isBillFilled && isConsFilled && !isTariffFilled) {
            // falta TARIFA → T = G / C
            if (consVal !== 0) {
                const resultadoTariff = billVal / consVal;
                inputTariff.value = Number.isFinite(resultadoTariff)
                    ? resultadoTariff.toFixed(3)
                    : "";
            } else {
                inputTariff.value = "";
            }
            return;
        }

        if (isBillFilled && isConsFilled && isTariffFilled) {
            // Se estiver tudo preenchido, recalcula baseado no último campo modificado
            if (changedId === 'consumo-medio') {
                // ALTEROU CONSUMO → recalc TARIFA
                if (consVal !== 0) {
                    const novaTarifa = billVal / consVal;
                    inputTariff.value = Number.isFinite(novaTarifa)
                        ? novaTarifa.toFixed(3)
                        : "";
                } else {
                    inputTariff.value = "";
                }
            }
            else if (changedId === 'tarifa') {
                // ALTEROU TARIFA → recalc CONSUMO
                if (tariffVal !== 0) {
                    const novoConsumo = billVal / tariffVal;
                    inputConsume.value = Number.isFinite(novoConsumo)
                        ? novoConsumo.toFixed(2)
                        : "";
                } else {
                    inputConsume.value = "";
                }
            }
            else if (changedId === 'gasto-medio') {
                // ALTEROU GASTO → recalc CONSUMO (ou TARIFA)
                if (tariffVal !== 0) {
                    const novoConsumo = billVal / tariffVal;
                    inputConsume.value = Number.isFinite(novoConsumo)
                        ? novoConsumo.toFixed(2)
                        : "";
                }
                else if (consVal !== 0) {
                    const novaTarifa = billVal / consVal;
                    inputTariff.value = Number.isFinite(novaTarifa)
                        ? novaTarifa.toFixed(3)
                        : "";
                }
                else {
                    inputConsume.value = "";
                    inputTariff.value  = "";
                }
            }
            return;
        }
        // Menos de 2 campos válidos: não faz nada
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
            const response = await fetch(`${API_BASE_URL}/placa/`, { method: 'GET', headers: { 'Authorization': authHeader } });
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userPassword');
                    localStorage.removeItem('usuarioId');
                    showAppToast('Sessão expirada. Faça login novamente.', 'warning', 5000);
                    setTimeout(() => window.location.href = 'index.html', 5000);
                }
                throw new Error(`Erro ao buscar placas: ${response.status}`);
            }
            const placas = await response.json();
            todasAsPlacas = placas;
            placaSelect.innerHTML = '<option value="" disabled selected>Selecione uma placa</option>';
            if (placas && placas.length > 0) {
                placas.forEach(placa => {
                    const option = document.createElement('option');
                    option.value = placa.placaId;
                    option.dataset.potencia = placa.potencia || 'N/A';
                    option.dataset.dimensoes = placa.dimensaoX + ' x ' + placa.dimensaoY + ' x ' + placa.dimensaoZ  || 'N/A';
                    option.dataset.eficiencia = placa.eficiencia || 'N/A';
                    option.textContent = `${placa.marca || 'Marca Desconhecida'} ${placa.modelo || 'Modelo Desconhecido'} - ${placa.potencia || 'N/A'}W`;
                    placaSelect.appendChild(option);
                });
            } else {
                placaSelect.innerHTML = '<option value="" disabled selected>Nenhuma placa disponível</option>';
            }
        } catch (error) {
            console.error('Falha ao carregar placas:', error);
            placaSelect.innerHTML = '<option value="" disabled selected>Erro ao carregar placas</option>';
            showAppToast(`Falha ao carregar placas: ${error.message}`, 'error');
        }
        atualizarDetalhesPlaca();
    }

    function atualizarDetalhesPlaca() {
        const selectedOption = placaSelect.options[placaSelect.selectedIndex];
        if (!panelPowerEl || !panelDimensionsEl || !panelEfficiencyEl || !panelDetailsPlaceholder) return;

        if (placaSelect.value && selectedOption.value !== "") {
            panelPowerEl.textContent = `${selectedOption.dataset.potencia || '--'} W`;
            panelDimensionsEl.textContent = selectedOption.dataset.dimensoes || '--';
            panelEfficiencyEl.textContent = `${selectedOption.dataset.eficiencia || '--'} %`;
            panelDetailsPlaceholder.style.display = 'none';
        } else {
            panelPowerEl.textContent = '-- W';
            panelDimensionsEl.textContent = '--';
            panelEfficiencyEl.textContent = '-- %';
            panelDetailsPlaceholder.style.display = 'block';
        }
    }

    if (placaSelect) {
        carregarPlacas();
        placaSelect.addEventListener('change', atualizarDetalhesPlaca);
    }

    // =====================================================================================
    // Substituímos a lógica de Chart.js por ApexCharts:
    // =====================================================================================

    function renderROIGraph(labels, lucroData, paybackPeriod, paybackAchieved, custoInicial) {
        if (!chartsContainer) return;

        // Limpa o container (se já existia um gráfico)
        chartsContainer.innerHTML = '';

        // Cria um <div> interno para o ApexCharts
        const chartDiv = document.createElement('div');
        chartDiv.id = 'roiChart';
        // Faz com que ocupe 100% da área disponível
        chartDiv.style.width = '100%';
        chartDiv.style.height = '100%';
        chartsContainer.appendChild(chartDiv);

        // Se já existia uma instância anterior do ApexCharts, destrua-a
        if (roiChartInstance) {
            try {
                roiChartInstance.destroy();
            } catch (e) {
                // se der erro ao destruir, ignora
            }
        }

        // Índice do ponto de PAYBACK (para destacar)
        const paybackIndex = paybackAchieved ? labels.indexOf(paybackPeriod) : -1;

        // Funções para detectar cores conforme tema:
        function isDarkMode() {
            return document.documentElement.classList.contains('dark');
        }
        function textColor() {
            return isDarkMode()
                ? '#E5E7EB'  // equivalente ao rgba(229,231,235,0.8) em hex
                : '#374151'; // equivalente ao rgba(55,65,81,1)
        }
        function gridColor() {
            return isDarkMode()
                ? 'rgba(75, 85, 99, 0.5)'
                : 'rgba(229, 231, 235, 0.8)';
        }
        function tooltipBgColor() {
            return isDarkMode()
                ? '#1F2937'  // rgba(31,41,55,0.9) em hex
                : '#FFFFFF'; // rgba(255,255,255,0.95)
        }
        function tooltipTextColor() {
            return isDarkMode()
                ? '#E5E7EB'
                : '#374151';
        }

        // Monta os tamanhos e cores dos marcadores (markers)
        const markerSizes = labels.map((_, idx) => (paybackAchieved && idx === paybackIndex ? 8 : 5));
        const markerColors = lucroData.map((lucro, idx) => {
            if (paybackAchieved && idx === paybackIndex) {
                return '#00FF00'; // verde vivo para PAYBACK
            }
            return lucro >= 0
                ? 'rgba(75, 192, 192, 0.8)'  // azul-esverdeado para lucro
                : 'rgba(255, 99, 132, 0.8)';  // rosa-avermelhado para prejuízo
        });

        // Configuração do gráfico ApexCharts
        const options = {
            chart: {
                type: 'area',
                height: '100%',
                width: '100%',
                toolbar: { show: false },
                animations: {
                    enabled: true,
                    easing: 'easeinout',
                    speed: 800
                },
                foreColor: textColor(), // cor dos textos dentro do gráfico
                background: 'transparent'
            },
            theme: {
                mode: isDarkMode() ? 'dark' : 'light'
            },
            series: [{
                name: 'Lucro Acumulado (R$)',
                data: lucroData
            }],
            stroke: {
                curve: 'smooth',
                width: 3
            },
            fill: {
                type: 'gradient',
                gradient: {
                    shade: isDarkMode() ? 'dark' : 'light',
                    shadeIntensity: 0.2,
                    opacityFrom: isDarkMode() ? 0.4 : 0.5,
                    opacityTo: isDarkMode() ? 0.05 : 0.1,
                    stops: [0, 100]
                }
            },
            markers: {
                size: markerSizes,
                colors: markerColors,
                strokeColors: markerColors,
                strokeWidth: 2,
                hover: {
                    sizeOffset: 2
                }
            },
            xaxis: {
                categories: labels,
                labels: {
                    style: {
                        colors: Array(labels.length).fill(textColor()),
                        fontSize: '12px'
                    }
                },
                title: {
                    text: 'Período',
                    style: {
                        color: textColor(),
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                },
                crosshairs: {
                    stroke: {
                        color: gridColor(),
                        dashArray: 4
                    }
                }
            },
            yaxis: {
                title: {
                    text: 'Lucro Acumulado (R$)',
                    style: {
                        color: textColor(),
                        fontWeight: 'bold',
                        fontSize: '14px'
                    }
                },
                labels: {
                    formatter: function (value) {
                        return 'R$ ' + value.toLocaleString('pt-BR', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0
                        });
                    },
                    style: {
                        colors: Array(6).fill(textColor()),
                        fontSize: '12px'
                    }
                },
                axisBorder: {
                    show: false
                },
                axisTicks: {
                    show: false
                }
            },
            grid: {
                show: true,
                borderColor: gridColor(),
                strokeDashArray: 4
            },
            tooltip: {
                theme: isDarkMode() ? 'dark' : 'light',
                marker: {
                    show: true
                },
                x: {
                    show: true
                },
                y: {
                    formatter: function (value) {
                        return 'R$ ' + value.toLocaleString('pt-BR', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        });
                    },
                    title: {
                        formatter: () => ''
                    }
                },
                style: {
                    fontSize: '12px',
                    fontFamily: 'inherit'
                },
                background: tooltipBgColor(),
                foreColor: tooltipTextColor(),
                borderColor: gridColor(),
                borderWidth: 1
            },
            legend: {
                show: false
            },
            title: {
                text: 'Projeção de Retorno do Investimento',
                align: 'center',
                style: {
                    fontSize: '18px',
                    fontWeight: '600',
                    color: textColor()
                }
            },
            responsive: [
                {
                    breakpoint: 768,
                    options: {
                        markers: {
                            size: markerSizes.map(s => s - 2) // reduz um pouco em telas menores
                        },
                        stroke: {
                            width: 2
                        }
                    }
                }
            ]
        };

        // Cria a instância ApexCharts
        roiChartInstance = new ApexCharts(chartDiv, options);
        roiChartInstance.render();
    }

    // =====================================================================================
    // Resto do código (manipulação do botão “Calcular” e chamadas à API) permanece inalterado
    // =====================================================================================

    if (calculateBtn) {
        calculateBtn.addEventListener('click', async () => {
            const custoContaEnergiaStr = inputBill.value || "";
            const consumoEnergiaStr = inputConsume.value || "";
            const tarifaEnergiaStr = inputTariff.value || "";

            const custoContaEnergiaVal = parseFloat(custoContaEnergiaStr.replace(',', '.'));
            const consumoEnergiaVal = parseFloat(consumoEnergiaStr.replace(',', '.'));
            const tarifaEnergiaVal = parseFloat(tarifaEnergiaStr.replace(',', '.'));

            const selectedPlacaIdVal = placaSelect.value;
            const quantidadeVal = parseInt(inputQntPlaca.value, 10);
            const areaSelecionadaVal = parseFloat(localStorage.getItem('areaDesenhada')) || 0;
            const cepVal = addressInput.value.trim();
            const usuarioIdVal = localStorage.getItem('usuarioId');

            if (!usuarioIdVal) {
                showAppToast('Erro: ID do usuário não encontrado. Faça login novamente.', 'warning');
                window.location.href = 'index.html';
                return;
            }
            if (!selectedPlacaIdVal) {
                showAppToast('Por favor, selecione uma placa solar.', 'warning');
                return;
            }
            if (!cepVal) {
                showAppToast('Por favor, informe o CEP ou endereço completo.', 'warning');
                return;
            }
            if (isNaN(quantidadeVal) || quantidadeVal <= 0) {
                showAppToast('Informe uma quantidade de placas válida.', 'warning');
                return;
            }
            if (isNaN(consumoEnergiaVal) || consumoEnergiaVal < 0) {
                showAppToast('Informe um consumo médio mensal válido.', 'warning');
                return;
            }
            if (areaSelecionadaVal <= 0) {
                showAppToast('Por favor, desenhe uma área válida no mapa.', 'warning');
                return;
            }

            const calculoData = {
                usuarioId: parseInt(usuarioIdVal, 10),
                placaId: parseInt(selectedPlacaIdVal, 10),
                cep: cepVal,
                quantidade: quantidadeVal,
                custoInstalacao: 0,
                gastoEnergia: custoContaEnergiaVal,
                areaSelecionada: areaSelecionadaVal
            };
            console.log("Enviando para /calculo/:", calculoData);

            const authHeader = `Basic ${btoa(`admin:admin`)}`;
            const originalButtonHTML = calculateBtn.innerHTML;

            calculateBtn.disabled = true;
            calculateBtn.innerHTML = `
                <svg class="animate-spin h-5 w-5 mr-3 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg> Calculando...
            `;

            try {
                const responseCalculo = await fetch(`${API_BASE_URL}/calculo/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
                    body: JSON.stringify(calculoData)
                });

                if (!responseCalculo.ok) {
                    const errorData = await responseCalculo.json().catch(() => ({ message: 'Erro desconhecido ao processar cálculo.' }));
                    throw new Error(errorData.message || `Falha ao criar o cálculo (Status: ${responseCalculo.status})`);
                }

                const calculoCriado = await responseCalculo.json();
                console.log("Cálculo criado:", calculoCriado);

                const custoInicial = calculoCriado.custoEstimadoTotal || 0;

                if (resultArea) {
                    resultArea.textContent = `${calculoCriado.areaSelecionadaM2
                        ? calculoCriado.areaSelecionadaM2.toFixed(2).replace('.', ',')
                        : areaSelecionadaVal.toFixed(2).replace('.', ',')} m²`;
                }
                if (resultPanels) resultPanels.textContent = calculoCriado.quantidadePaineis || '--';
                if (resultCost) resultCost.textContent = `R$ ${custoInicial.toFixed(2).replace('.', ',')}`;

                if (resultsSection) {
                    resultsSection.style.display = 'block';
                    resultsSection.scrollIntoView({ behavior: 'smooth' });
                }

                if (calculoCriado.calculoId) {
                    const roiResponse = await fetch(`${API_BASE_URL}/calculo/ROI/${calculoCriado.calculoId}`, {
                        method: 'GET',
                        headers: { 'Authorization': authHeader }
                    });

                    if (!roiResponse.ok) {
                        throw new Error(`Falha ao buscar dados de ROI (Status: ${roiResponse.status})`);
                    }
                    const roiDataAPI = await roiResponse.json();

                    if (roiDataAPI && roiDataAPI.length > 0) {
                        let paybackPeriod = "Não alcançado";
                        let paybackAchieved = false;
                        const labels = [];
                        const lucroData = [];

                        // Adiciona o ponto inicial negativo
                        labels.push('Início');
                        lucroData.push(-custoInicial);

                        // Adiciona os dados da API
                        roiDataAPI.forEach(item => {
                            labels.push(item.periodo);
                            lucroData.push(item.lucro);
                            if (item.payback && !paybackAchieved) {
                                paybackPeriod = item.periodo;
                                paybackAchieved = true;
                            }
                        });

                        if (resultRoi) {
                            resultRoi.innerHTML = paybackAchieved
                                ? `<span class="text-green-500 dark:text-green-400">${paybackPeriod}</span>`
                                : `<span class="text-red-500 dark:text-red-400">${paybackPeriod}</span>`;
                        }
                        renderROIGraph(labels, lucroData, paybackPeriod, paybackAchieved, custoInicial);
                    } else {
                        if (resultRoi) resultRoi.textContent = 'Dados de ROI indisponíveis';
                        if (chartsContainer) {
                            chartsContainer.innerHTML = `
                                <p class="text-center text-gray-500 dark:text-gray-400">
                                    Dados de ROI não encontrados para este cálculo.
                                </p>`;
                        }
                    }
                } else {
                    if (resultRoi) resultRoi.textContent = 'ID do cálculo inválido.';
                    if (chartsContainer) {
                        chartsContainer.innerHTML = `
                            <p class="text-center text-gray-500 dark:text-gray-400">
                                Não foi possível carregar a projeção de ROI (ID do cálculo ausente).
                            </p>`;
                    }
                }

            } catch (error) {
                showAppToast(`Erro: ${error.message}`, 'error', 7000);
                console.error("Erro detalhado:", error);
                if (chartsContainer) {
                    chartsContainer.innerHTML = `
                        <p class="text-center text-red-500 dark:text-red-400">
                            Erro ao realizar simulação: ${error.message}
                        </p>`;
                }
                if (resultsSection) resultsSection.style.display = 'none';
            } finally {
                calculateBtn.innerHTML = originalButtonHTML;
                calculateBtn.disabled = false;
            }
        });
    }

}); // fim do DOMContentLoaded
