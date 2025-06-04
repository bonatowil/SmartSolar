// ../assets/js/calc.js

document.addEventListener('DOMContentLoaded', () => {
    const solarForm = document.getElementById('solar-form'); 
    const addressInput = document.getElementById('address');
    
    const inputBill = document.getElementById('gasto-medio');
    const inputConsume = document.getElementById('consumo-medio');
    const inputTariff = document.getElementById('tarifa');
    const inputQntPlaca = document.getElementById('qnt-placa'); // Certifique-se que este ID está correto no HTML
    const placaSelect = document.getElementById('placa-selecionada');
    const calculateBtn = document.getElementById('calculate-btn');

    const resultsSection = document.getElementById('results-section');
    const resultArea = document.getElementById('result-area');
    const resultPanels = document.getElementById('result-panels');
    const resultCost = document.getElementById('result-cost');
    const resultRoi = document.getElementById('result-roi');
    const chartsContainer = document.getElementById('charts-container');

    const API_BASE_URL = 'http://localhost:8080';
    let todasAsPlacas = []; 

    function recalcOnBlur(event) {
        const changedId = event.target.id;
        const billVal = parseFloat(inputBill.value.replace(',', '.'));
        const consVal = parseFloat(inputConsume.value.replace(',', '.'));
        const tariffVal = parseFloat(inputTariff.value.replace(',', '.'));
        const isBillFilled = !isNaN(billVal) && inputBill.value.trim() !== '';
        const isConsFilled = !isNaN(consVal) && inputConsume.value.trim() !== '';
        const isTariffFilled = !isNaN(tariffVal) && inputTariff.value.trim() !== '';

        if (isBillFilled && isConsFilled && isTariffFilled) {
            if (changedId === 'gasto-medio' || changedId === 'consumo-medio') {
                if (consVal !== 0) { const resultadoTariff = billVal / consVal; inputTariff.value = Number.isFinite(resultadoTariff) ? resultadoTariff.toFixed(2).replace('.', ',') : '';} else {inputTariff.value = '';}
            } else if (changedId === 'tarifa') {
                 if (tariffVal !== 0) { const resultadoCons = billVal / tariffVal; inputConsume.value = Number.isFinite(resultadoCons) ? resultadoCons.toFixed(2).replace('.', ',') : '';} else { inputConsume.value = '';}
            } return;
        }
        if (!isBillFilled && isConsFilled && isTariffFilled) { const resultadoBill = consVal * tariffVal; inputBill.value = Number.isFinite(resultadoBill) ? resultadoBill.toFixed(2).replace('.', ',') : ''; return; }
        if (isBillFilled && !isConsFilled && isTariffFilled) { if (tariffVal !== 0) { const resultadoCons = billVal / tariffVal; inputConsume.value = Number.isFinite(resultadoCons) ? resultadoCons.toFixed(2).replace('.', ',') : ''; } else { inputConsume.value = '';} return; }
        if (isBillFilled && isConsFilled && !isTariffFilled) { if (consVal !== 0) { const resultadoTariff = billVal / consVal; inputTariff.value = Number.isFinite(resultadoTariff) ? resultadoTariff.toFixed(2).replace('.', ',') : ''; } else { inputTariff.value = '';} return; }
    }
    if (inputBill && inputConsume && inputTariff) {
        [inputBill, inputConsume, inputTariff].forEach(input => {
            input.addEventListener('blur', recalcOnBlur);
        });
    }

    async function carregarPlacas() {
        if (!placaSelect) return;
        const email = localStorage.getItem('userEmail');
        const password = localStorage.getItem('userPassword');
        if (!email || !password) { placaSelect.innerHTML = '<option value="" disabled selected>Faça o login para ver as placas</option>'; return; }
        const authHeader = `Basic ${btoa(`admin:admin`)}`;
        try {
            const response = await fetch(`${API_BASE_URL}/placa/`, { method: 'GET', headers: { 'Authorization': authHeader } });
            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('userEmail');localStorage.removeItem('userPassword');localStorage.removeItem('usuarioId');
                    alert('Sessão expirada. Faça login.'); window.location.href = 'index.html';
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
                    option.textContent = `${placa.marca || ''} ${placa.modelo || ''} - ${placa.potencia || 'N/A'}W`;
                    placaSelect.appendChild(option);
                });
            } else { placaSelect.innerHTML = '<option value="" disabled selected>Nenhuma placa disponível</option>'; }
        } catch (error) { console.error('Falha ao carregar placas:', error); placaSelect.innerHTML = '<option value="" disabled selected>Erro ao carregar placas</option>'; }
    }

    if (calculateBtn) {
        calculateBtn.addEventListener('click', async () => {
            const custoEnergiaVal = parseFloat(inputBill.value.replace(',', '.'));
            const consumoEnergiaVal = parseFloat(inputConsume.value.replace(',', '.'));
            const selectedPlacaIdVal = placaSelect.value;
            const quantidadeVal = parseInt(inputQntPlaca.value, 10);
            const areaSelecionadaVal = parseFloat(localStorage.getItem('areaDesenhada')) || 0;
            const cepVal = addressInput.value.trim(); // Usar o campo de endereço para o CEP
            const usuarioIdVal = localStorage.getItem('usuarioId');

            if (!usuarioIdVal) { alert('Erro: ID do usuário não encontrado. Faça login novamente.'); window.location.href = 'index.html'; return; }
            if (!selectedPlacaIdVal) { alert('Por favor, selecione uma placa solar.'); return; }
            if (!cepVal) { alert('Por favor, informe o CEP ou endereço completo.'); return; }
            if (isNaN(quantidadeVal) || quantidadeVal <= 0) { alert('Informe uma quantidade de placas válida (maior que zero).'); return; }
            if (isNaN(consumoEnergiaVal) || consumoEnergiaVal <= 0) { alert('Informe um consumo de energia válido (maior que zero).'); return; }
            if (isNaN(custoEnergiaVal) || custoEnergiaVal < 0) { alert('Informe um custo de energia válido.'); return; }
            if (areaSelecionadaVal <= 0) { alert('Por favor, desenhe uma área válida no mapa.'); return; }

            const calculoData = {
                usuarioId: parseInt(usuarioIdVal, 10),
                placaId: parseInt(selectedPlacaIdVal, 10),
                cep: cepVal,
                quantidade: quantidadeVal,
                consumoEnergia: consumoEnergiaVal,
                custoEnergia: custoEnergiaVal,
                areaSelecionada: areaSelecionadaVal
            };

            const email = localStorage.getItem('userEmail');
            const password = localStorage.getItem('userPassword');
            if (!email || !password) { alert('Sessão inválida. Por favor, faça o login.'); window.location.href = 'index.html'; return; }
            const authHeader = `Basic ${btoa(`admin:admin`)}`;

            const calcButtonIcon = calculateBtn.querySelector('i');
            const calcButtonText = calculateBtn.querySelector('span') || calculateBtn; // Fallback para o próprio botão se não houver span
            const originalButtonHTML = calculateBtn.innerHTML; // Salva o HTML original do botão
            
            calculateBtn.disabled = true;
            calculateBtn.innerHTML = `<svg class="animate-spin h-5 w-5 mr-2 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Calculando...`;


            try {
                const responseCalculo = await fetch(`${API_BASE_URL}/calculo/`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': authHeader },
                    body: JSON.stringify(calculoData)
                });

                if (!responseCalculo.ok) {
                    if (responseCalculo.status === 401) { /* ...tratamento 401 já incluído acima ... */ }
                    const errorData = await responseCalculo.json().catch(() => ({message: 'Erro ao processar cálculo.'}));
                    throw new Error(errorData.message || `Falha ao criar o cálculo (Status: ${responseCalculo.status})`);
                }

                const calculoCriado = await responseCalculo.json();

                if(resultArea) resultArea.textContent = `${calculoCriado.areaSelecionadaM2 ? calculoCriado.areaSelecionadaM2.toFixed(2).replace('.', ',') : areaSelecionadaVal.toFixed(2).replace('.', ',')} m²`;
                if(resultPanels) resultPanels.textContent = calculoCriado.quantidadePaineis || '--'; 
                if(resultCost) resultCost.textContent = `R$ ${calculoCriado.custoEstimadoTotal ? calculoCriado.custoEstimadoTotal.toFixed(2).replace('.', ',') : '--'}`;
                if(resultRoi) resultRoi.textContent = '-- anos'; // ROI não é mais buscado aqui
                if(chartsContainer) chartsContainer.innerHTML = `<p class="text-center">Cálculo ID: ${calculoCriado.calculoId}. Gráficos de projeção em breve.</p>`; 
                
                if(resultsSection) resultsSection.style.display = 'block';
                resultsSection.scrollIntoView({ behavior: 'smooth' });

            } catch (error) {
                alert(`Erro no cálculo: ${error.message}`);
                console.error("Erro no cálculo:", error);
            } finally {
                calculateBtn.innerHTML = originalButtonHTML; // Restaura o HTML original do botão
                calculateBtn.disabled = false;
            }
        });
    }

    if (placaSelect) {
        carregarPlacas();
    }
});