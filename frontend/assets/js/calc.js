// ../assets/js/calc.js

document.addEventListener('DOMContentLoaded', () => {
    // Referências aos elementos do DOM
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
    const resultRoi = document.getElementById('result-roi'); // Para o texto de payback
    const chartsContainer = document.getElementById('charts-container'); // Para o gráfico

    // Detalhes da Placa Selecionada
    const panelPowerEl = document.getElementById('panel-power');
    const panelDimensionsEl = document.getElementById('panel-dimensions');
    const panelEfficiencyEl = document.getElementById('panel-efficiency');
    const panelDetailsPlaceholder = document.getElementById('panel-details-placeholder');


    const API_BASE_URL = 'http://localhost:8080';
    let todasAsPlacas = [];
    let roiChartInstance = null; // Variável para armazenar a instância do gráfico

    function recalcOnBlur(event) {
        const changedId = event.target.id;
        // Assegura que os valores sejam tratados como strings antes de substituir a vírgula
        const billStr = inputBill.value || "";
        const consStr = inputConsume.value || "";
        const tariffStr = inputTariff.value || "";

        const billVal = parseFloat(billStr.replace(',', '.'));
        const consVal = parseFloat(consStr.replace(',', '.'));
        const tariffVal = parseFloat(tariffStr.replace(',', '.'));

        const isBillFilled = !isNaN(billVal) && billStr.trim() !== '';
        const isConsFilled = !isNaN(consVal) && consStr.trim() !== '';
        const isTariffFilled = !isNaN(tariffVal) && tariffStr.trim() !== '';

        if (isBillFilled && isConsFilled && isTariffFilled) {
            if (changedId === 'gasto-medio' || changedId === 'consumo-medio') {
                if (consVal !== 0) { const resultadoTariff = billVal / consVal; inputTariff.value = Number.isFinite(resultadoTariff) ? resultadoTariff.toFixed(3).replace('.', ',') : '';} else {inputTariff.value = '';}
            } else if (changedId === 'tarifa') {
                 if (tariffVal !== 0) { const resultadoCons = billVal / tariffVal; inputConsume.value = Number.isFinite(resultadoCons) ? resultadoCons.toFixed(2).replace('.', ',') : '';} else { inputConsume.value = '';}
            } return;
        }
        if (!isBillFilled && isConsFilled && isTariffFilled) { const resultadoBill = consVal * tariffVal; inputBill.value = Number.isFinite(resultadoBill) ? resultadoBill.toFixed(2).replace('.', ',') : ''; return; }
        if (isBillFilled && !isConsFilled && isTariffFilled) { if (tariffVal !== 0) { const resultadoCons = billVal / tariffVal; inputConsume.value = Number.isFinite(resultadoCons) ? resultadoCons.toFixed(2).replace('.', ',') : ''; } else { inputConsume.value = '';} return; }
        if (isBillFilled && isConsFilled && !isTariffFilled) { if (consVal !== 0) { const resultadoTariff = billVal / consVal; inputTariff.value = Number.isFinite(resultadoTariff) ? resultadoTariff.toFixed(3).replace('.', ',') : ''; } else { inputTariff.value = '';} return; }
    }

    if (inputBill && inputConsume && inputTariff) {
        [inputBill, inputConsume, inputTariff].forEach(input => {
            input.addEventListener('blur', recalcOnBlur);
            // Para permitir que o usuário digite vírgula e ela seja convertida para ponto internamente
            input.addEventListener('input', (e) => {
                // e.target.value = e.target.value.replace('.', ','); // Opcional: forçar vírgula na digitação
            });
        });
    }

    async function carregarPlacas() {
        if (!placaSelect) return;
        const authHeader = `Basic ${btoa(`admin:admin`)}`; // Ajuste conforme sua autenticação
        try {
            const response = await fetch(`${API_BASE_URL}/placa/`, { method: 'GET', headers: { 'Authorization': authHeader } });
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('userEmail');localStorage.removeItem('userPassword');localStorage.removeItem('usuarioId');
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
                    option.dataset.dimensoes = placa.dimensoes || 'N/A';
                    option.dataset.eficiencia = placa.eficiencia || 'N/A';
                    option.textContent = `${placa.marca || 'Marca Desconhecida'} ${placa.modelo || 'Modelo Desconhecido'} - ${placa.potencia || 'N/A'}W`;
                    placaSelect.appendChild(option);
                });
            } else { placaSelect.innerHTML = '<option value="" disabled selected>Nenhuma placa disponível</option>'; }
        } catch (error) {
            console.error('Falha ao carregar placas:', error);
            placaSelect.innerHTML = '<option value="" disabled selected>Erro ao carregar placas</option>';
            showAppToast(`Falha ao carregar placas: ${error.message}`, 'error');
        }
        atualizarDetalhesPlaca(); // Chama para limpar ou mostrar placeholder inicialmente
    }

    function atualizarDetalhesPlaca() {
        const selectedOption = placaSelect.options[placaSelect.selectedIndex];
        if (!panelPowerEl || !panelDimensionsEl || !panelEfficiencyEl || !panelDetailsPlaceholder) return;

        if (placaSelect.value && selectedOption && selectedOption.value !== "") {
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

    // Funções de cor para o gráfico
    function getTextColor() { return document.documentElement.classList.contains('dark') ? 'rgba(229, 231, 235, 0.8)' : 'rgba(55, 65, 81, 1)'; } // Um pouco mais claro para dark
    function getGridColor() { return document.documentElement.classList.contains('dark') ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.8)'; } // Mais suave para dark
    function getTooltipBackgroundColor() { return document.documentElement.classList.contains('dark') ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.95)'; }


    function renderROIGraph(labels, lucroData, paybackPeriod, paybackAchieved, custoInicial) {
        if (chartsContainer) {
            chartsContainer.innerHTML = '';
            const canvas = document.createElement('canvas');
            canvas.id = 'roiChartCanvas';
            chartsContainer.appendChild(canvas);
            const ctx = canvas.getContext('2d');

            if (roiChartInstance) {
                roiChartInstance.destroy();
            }

            const paybackIndex = paybackAchieved ? labels.indexOf(paybackPeriod) : -1;

            const pointBackgroundColors = lucroData.map((lucro, index) => {
                if (paybackAchieved && index === paybackIndex) return 'rgba(0, 255, 0, 1)'; // Verde brilhante para PAYBACK
                return lucro >= 0 ? 'rgba(75, 192, 192, 0.8)' : 'rgba(255, 99, 132, 0.8)'; // Azul esverdeado para lucro, Vermelho para prejuízo
            });
            const pointBorderColors = pointBackgroundColors; // Mesma cor para borda do ponto

            const pointRadius = labels.map((label, index) => (paybackAchieved && index === paybackIndex) ? 8 : 5);


            roiChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Lucro Acumulado (R$)',
                        data: lucroData,
                        borderColor: getTextColor(), // Cor da linha principal
                        backgroundColor: document.documentElement.classList.contains('dark') ? 'rgba(75, 192, 192, 0.3)' : 'rgba(75, 192, 192, 0.5)',
                        tension: 0.3,
                        fill: true,
                        yAxisID: 'y-lucro',
                        pointBackgroundColor: pointBackgroundColors,
                        pointBorderColor: pointBorderColors,
                        pointRadius: pointRadius,
                        pointHoverRadius: pointRadius.map(r => r + 2),
                        pointBorderWidth: 1,
                        pointHoverBorderWidth: 2
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        x: {
                            title: { display: true, text: 'Período', color: getTextColor(), font: { weight: 'bold'} },
                            ticks: { color: getTextColor() },
                            grid: { color: getGridColor(), borderDash: [2, 3] }
                        },
                        'y-lucro': {
                            type: 'linear',
                            display: true,
                            position: 'left',
                            title: { display: true, text: 'Lucro Acumulado (R$)', color: getTextColor(), font: { weight: 'bold'} },
                            ticks: {
                                callback: (value) => 'R$ ' + value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }),
                                color: getTextColor()
                            },
                            grid: { color: getGridColor() }
                        }
                    },
                    plugins: {
                        tooltip: {
                            backgroundColor: getTooltipBackgroundColor(),
                            titleColor: getTextColor(),
                            bodyColor: getTextColor(),
                            borderColor: getGridColor(),
                            borderWidth: 1,
                            padding: 10,
                            callbacks: {
                                label: (context) => {
                                    let label = context.dataset.label || '';
                                    if (label) label += ': ';
                                    if (context.parsed.y !== null) {
                                        label += 'R$ ' + context.parsed.y.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                                    }
                                    if (paybackAchieved && context.dataIndex === paybackIndex) label += ' (PAYBACK)';
                                    return label;
                                }
                            }
                        },
                        legend: { display: false }, // Legenda pode ser desnecessária com um único dataset
                        title: {
                            display: true,
                            text: 'Projeção de Retorno do Investimento',
                            color: getTextColor(),
                            font: { size: 16, weight: 'bold' },
                            padding: { top: 10, bottom: 20 }
                        }
                    },
                    interaction: { mode: 'index', intersect: false },
                    elements: { line: { borderWidth: 3 } } // Linha mais grossa
                }
            });
        }
    }


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

            if (!usuarioIdVal) { showAppToast('Erro: ID do usuário não encontrado. Faça login novamente.', 'warning'); window.location.href = 'index.html'; return; }
            if (!selectedPlacaIdVal) { showAppToast('Por favor, selecione uma placa solar.', 'warning'); return; }
            if (!cepVal) { showAppToast('Por favor, informe o CEP ou endereço completo.', 'warning'); return; }
            if (isNaN(quantidadeVal) || quantidadeVal <= 0) { showAppToast('Informe uma quantidade de placas válida.', 'warning'); return; }
            if (isNaN(custoContaEnergiaVal) || custoContaEnergiaVal < 0) { showAppToast('Informe um gasto médio mensal válido.', 'warning'); return; }
            if (isNaN(consumoEnergiaVal) || consumoEnergiaVal < 0) { showAppToast('Informe um consumo médio mensal válido.', 'warning'); return; }
            if (isNaN(tarifaEnergiaVal) || tarifaEnergiaVal < 0) { showAppToast('Informe uma tarifa de energia válida.', 'warning'); return; }
            if (areaSelecionadaVal <= 0) { showAppToast('Por favor, desenhe uma área válida no mapa.', 'warning'); return; }

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
            calculateBtn.innerHTML = `<svg class="animate-spin h-5 w-5 mr-3 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Calculando...`;

            try {
                const responseCalculo = await fetch(`${API_BASE_URL}/calculo/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
                    body: JSON.stringify(calculoData)
                });

                if (!responseCalculo.ok) {
                    const errorData = await responseCalculo.json().catch(() => ({message: 'Erro desconhecido ao processar cálculo.'}));
                    throw new Error(errorData.message || `Falha ao criar o cálculo (Status: ${responseCalculo.status})`);
                }

                const calculoCriado = await responseCalculo.json();
                console.log("Cálculo criado:", calculoCriado);

                const custoInicial = calculoCriado.custoEstimadoTotal || 0;

                if(resultArea) resultArea.textContent = `${calculoCriado.areaSelecionadaM2 ? calculoCriado.areaSelecionadaM2.toFixed(2).replace('.', ',') : areaSelecionadaVal.toFixed(2).replace('.', ',')} m²`;
                if(resultPanels) resultPanels.textContent = calculoCriado.quantidadePaineis || '--';
                if(resultCost) resultCost.textContent = `R$ ${custoInicial.toFixed(2).replace('.', ',')}`;

                if(resultsSection) resultsSection.style.display = 'block';
                resultsSection.scrollIntoView({ behavior: 'smooth' });

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
                            if (item.payback && !paybackAchieved) { // Pega o primeiro payback
                                paybackPeriod = item.periodo;
                                paybackAchieved = true;
                            }
                        });

                        if (resultRoi) {
                            resultRoi.innerHTML = paybackAchieved ?
                                `<span class="text-green-500 dark:text-green-400">${paybackPeriod}</span>` :
                                `<span class="text-red-500 dark:text-red-400">${paybackPeriod}</span>`;
                        }
                        renderROIGraph(labels, lucroData, paybackPeriod, paybackAchieved, custoInicial);
                    } else {
                        if (resultRoi) resultRoi.textContent = 'Dados de ROI indisponíveis';
                        if (chartsContainer) chartsContainer.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">Dados de ROI não encontrados para este cálculo.</p>';
                    }
                } else {
                    if (resultRoi) resultRoi.textContent = 'ID do cálculo inválido.';
                    if (chartsContainer) chartsContainer.innerHTML = '<p class="text-center text-gray-500 dark:text-gray-400">Não foi possível carregar a projeção de ROI (ID do cálculo ausente).</p>';
                }

            } catch (error) {
                showAppToast(`Erro: ${error.message}`, 'error', 7000);
                console.error("Erro detalhado:", error);
                if (chartsContainer) chartsContainer.innerHTML = `<p class="text-center text-red-500 dark:text-red-400">Erro ao realizar simulação: ${error.message}</p>`;
                if(resultsSection) resultsSection.style.display = 'none'; // Esconde resultados se houve erro crítico
            } finally {
                calculateBtn.innerHTML = originalButtonHTML;
                calculateBtn.disabled = false;
            }
        });
    }
});