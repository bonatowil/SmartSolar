document.addEventListener('DOMContentLoaded', () => {
const inputBill    = document.getElementById('gasto-medio');
const inputConsume = document.getElementById('consumo-medio');
const inputTariff  = document.getElementById('tarifa');

function recalcOnBlur(event) {
    const changedId = event.target.id;

    // Converte string → número (aceita vírgula ou ponto)
    const billVal   = parseFloat(inputBill.value.replace(',', '.'));
    const consVal   = parseFloat(inputConsume.value.replace(',', '.'));
    const tariffVal = parseFloat(inputTariff.value.replace(',', '.'));

    const isBillFilled   = !isNaN(billVal);
    const isConsFilled   = !isNaN(consVal);
    const isTariffFilled = !isNaN(tariffVal);

    // 1) Se todos os três campos estiverem preenchidos:
    if (isBillFilled && isConsFilled && isTariffFilled) {
    // Aplicamos a regra de três com base em “gasto-médio” e no campo que mudou.
    if (changedId === 'gasto-medio') {
        // Se consumido existe, recalcula tarifa = gasto / consumo
        const resultadoTariff = billVal / consVal;
        inputTariff.value = Number.isFinite(resultadoTariff)
        ? resultadoTariff.toFixed(2)
        : '';
    }
    else if (changedId === 'consumo-medio') {
        // Recalcula tarifa = gasto / consumo
        const resultadoTariff = billVal / consVal;
        inputTariff.value = Number.isFinite(resultadoTariff)
        ? resultadoTariff.toFixed(2)
        : '';
    }
    else if (changedId === 'tarifa') {
        // Recalcula consumo = gasto / tarifa
        const resultadoCons = billVal / tariffVal;
        inputConsume.value = Number.isFinite(resultadoCons)
        ? resultadoCons.toFixed(2)
        : '';
    }
    return;
    }

    // 2) Se “gasto-médio” NÃO estiver preenchido, mas os outros DOIS estiverem:
    if (!isBillFilled && isConsFilled && isTariffFilled) {
    // Calcula gasto = consumo × tarifa
    const resultadoBill = consVal * tariffVal;
    inputBill.value = Number.isFinite(resultadoBill)
        ? resultadoBill.toFixed(2)
        : '';
    return;
    }

    // 3) Se “gasto-médio” estiver preenchido, mas faltar consumos ou tarifa:
    if (isBillFilled && !isConsFilled && isTariffFilled) {
    // Calcula consumo = gasto / tarifa
    const resultadoCons = billVal / tariffVal;
    inputConsume.value = Number.isFinite(resultadoCons)
        ? resultadoCons.toFixed(2)
        : '';
    return;
    }
    if (isBillFilled && isConsFilled && !isTariffFilled) {
    // Calcula tarifa = gasto / consumo
    const resultadoTariff = billVal / consVal;
    inputTariff.value = Number.isFinite(resultadoTariff)
        ? resultadoTariff.toFixed(2)
        : '';
    return;
    }

    // Em qualquer outro caso (apenas 0 ou 1 campo preenchido), não faz nada.
}

// Dispara o recálculo apenas ao sair do campo (blur)
[inputBill, inputConsume, inputTariff].forEach(input => {
    input.addEventListener('blur', recalcOnBlur);
});
});