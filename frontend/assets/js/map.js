// ../assets/js/map.js

let map;
let drawingManager;
let geocoder;
let lastPolygon = null;

const loadMapBtn = document.getElementById('load-map-btn');
const addressInput = document.getElementById('address');
const mapPlaceholder = document.getElementById('map-placeholder');
const mapDiv = document.getElementById('map');
const loadingSpinner = document.getElementById('loading-spinner');
const searchIcon = document.getElementById('search-icon');
const buttonText = document.getElementById('button-text');

const resultAreaElement = document.getElementById('result-area');
const deleteAreaBtn = document.getElementById('delete-area-btn');
const drawnAreaDisplayContainer = document.getElementById('drawn-area-display');
const mapDrawnAreaValue = document.getElementById('map-drawn-area-value');

const resultSolarDiv = document.getElementById('result-solar');
const solarPotentialText = document.getElementById('solar-potential-text');

// Dados de Irradiação Solar Média Diária (kWh/m²/dia) por Estado - Fonte: Atlas Solarimétrico do Brasil
const irradiacaoMediaPorEstado = {
    'AC': 4.85, 'AL': 5.40, 'AP': 5.10, 'AM': 4.70, 'BA': 5.75, 'CE': 5.80,
    'DF': 5.60, 'ES': 5.25, 'GO': 5.65, 'MA': 5.50, 'MT': 5.55, 'MS': 5.60,
    'MG': 5.70, 'PA': 5.00, 'PB': 5.75, 'PR': 4.90, 'PE': 5.70, 'PI': 5.85,
    'RJ': 5.30, 'RN': 5.80, 'RS': 4.80, 'RO': 5.15, 'RR': 5.20, 'SC': 4.75,
    'SP': 5.45, 'SE': 5.60, 'TO': 5.60
};

/**
 * Salva a irradiação média do estado no localStorage e atualiza a UI.
 * @param {string} uf - A sigla do estado (ex: 'SP').
 */
function salvarIrradiacaoPorEstado(uf) {
    if (resultSolarDiv) resultSolarDiv.style.display = 'block';

    const ufUpper = uf.toUpperCase();
    const irradiacao = irradiacaoMediaPorEstado[ufUpper];

    if (irradiacao) {
        localStorage.setItem('mediaIrradiacaoEstado', irradiacao);
        if (solarPotentialText) {
            solarPotentialText.innerHTML = `Irradiação Média para ${ufUpper}: <strong>${irradiacao} kWh/m²/dia</strong>`;
        }
        showAppToast(`Média de irradiação para ${ufUpper} definida: ${irradiacao} kWh/m²/dia.`, 'success');
    } else {
        localStorage.removeItem('mediaIrradiacaoEstado');
        if (solarPotentialText) {
            solarPotentialText.innerHTML = `<i class="fas fa-exclamation-triangle text-red-500 mr-2"></i> Não foi possível encontrar a média de irradiação para o estado.`;
        }
        showAppToast(`Não foi possível determinar a irradiação para o estado: ${ufUpper}`, 'error');
    }
}

function initMapApp() {
    geocoder = new google.maps.Geocoder();
    console.log("Google Maps API carregada e pronta.");

    if (loadMapBtn) {
        loadMapBtn.addEventListener('click', handleLoadMapClick);
    }
    if (deleteAreaBtn) {
        deleteAreaBtn.addEventListener('click', handleDeleteDrawnArea);
    }
}

function handleDeleteDrawnArea() {
    if (lastPolygon) {
        lastPolygon.setMap(null);
        lastPolygon = null;
        localStorage.removeItem('areaDesenhada');
        if (resultSolarDiv) resultSolarDiv.style.display = 'none';
        if (drawnAreaDisplayContainer) drawnAreaDisplayContainer.style.display = 'none';
        if (deleteAreaBtn) deleteAreaBtn.style.display = 'none';
        showAppToast('Área removida.', 'success');
    } else {
        showAppToast('Nenhuma área para excluir.', 'error');
    }
}

function initializeMap(lat, lng) {
    localStorage.removeItem('areaDesenhada');
    if (resultSolarDiv) resultSolarDiv.style.display = 'none';

    const mapOptions = {
        center: { lat: lat, lng: lng },
        zoom: 18,
        mapTypeId: 'satellite',
        disableDefaultUI: true,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
    };

    if (!map) {
        mapPlaceholder.style.display = 'none';
        mapDiv.style.display = 'block';
        map = new google.maps.Map(mapDiv, mapOptions);

        drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: [google.maps.drawing.OverlayType.POLYGON],
            },
            polygonOptions: {
                fillColor: '#38A169',
                fillOpacity: 0.4,
                strokeWeight: 2,
                strokeColor: '#1A5D1A',
                clickable: false,
                editable: true,
                zIndex: 1,
            },
        });
        drawingManager.setMap(map);

        google.maps.event.addListener(drawingManager, 'polygoncomplete', function (polygon) {
            if (lastPolygon) {
                lastPolygon.setMap(null);
            }
            lastPolygon = polygon;

            const path = polygon.getPath();
            const area = google.maps.geometry.spherical.computeArea(path);
            const areaFormatted = area.toFixed(2);

            localStorage.setItem('areaDesenhada', areaFormatted);
            if (mapDrawnAreaValue) mapDrawnAreaValue.textContent = `${areaFormatted} m²`;
            if (drawnAreaDisplayContainer) drawnAreaDisplayContainer.style.display = 'block';
            if (deleteAreaBtn) deleteAreaBtn.style.display = 'flex';
            
            showAppToast(`Área selecionada: ${areaFormatted} m².`, 'info');
            drawingManager.setDrawingMode(null);
        });

    } else {
        map.setCenter({ lat: lat, lng: lng });
        map.setZoom(18);
        if (lastPolygon) {
            lastPolygon.setMap(null);
            lastPolygon = null;
        }
    }
}

function isCep(value) {
    return /^\d{5}-?\d{3}$/.test(value);
}

function setButtonLoadingState(isLoading) {
    if (!loadMapBtn) return;
    loadMapBtn.disabled = isLoading;
    if (isLoading) {
        if (searchIcon) searchIcon.style.display = 'none';
        if (buttonText) buttonText.textContent = 'Carregando...';
        if (loadingSpinner) loadingSpinner.classList.remove('hidden');
    } else {
        if (searchIcon) searchIcon.style.display = 'inline-block';
        if (buttonText) buttonText.textContent = 'Buscar';
        if (loadingSpinner) loadingSpinner.classList.add('hidden');
    }
}

async function handleLoadMapClick() {
    const inputValue = addressInput.value.trim();
    if (!inputValue) {
        showAppToast('Por favor, insira um CEP ou endereço.', 'warning');
        return;
    }
    setButtonLoadingState(true);

    try {
        if (isCep(inputValue)) {
            const cep = inputValue.replace('-', '');
            const response = await fetch(
                `http://localhost:8080/calculo/endereco?cep=${encodeURIComponent(cep)}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('admin:admin')
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.latitude != null && data.longitude != null) {
                    initializeMap(parseFloat(data.latitude), parseFloat(data.longitude));
                    // Se o backend já retorna a UF, usa ela
                    if (data.uf) {
                        salvarIrradiacaoPorEstado(data.uf);
                    } else {
                        // Senão, busca no Google para descobrir a UF
                        await buscarPorEnderecoCompletoGoogle(inputValue);
                    }
                } else {
                    await buscarPorEnderecoCompletoGoogle(inputValue);
                }
            } else {
                 await buscarPorEnderecoCompletoGoogle(inputValue);
            }
        } else {
            await buscarPorEnderecoCompletoGoogle(inputValue);
        }
    } catch (error) {
        console.error('Erro no processo de carregar mapa:', error);
        showAppToast('Ocorreu um erro ao processar o endereço.', 'error');
    } finally {
        setButtonLoadingState(false);
    }
}

async function buscarPorEnderecoCompletoGoogle(endereco) {
    if (!geocoder) {
        showAppToast("Erro: Serviço de geocodificação não está pronto.", 'error');
        return;
    }
    
    geocoder.geocode({ 'address': endereco, 'region': 'BR' }, (results, status) => {
        if (status === 'OK' && results[0]) {
            const location = results[0].geometry.location;
            initializeMap(location.lat(), location.lng());

            // Extrai a sigla do estado (UF) da resposta do Geocoder
            const addressComponents = results[0].address_components;
            const stateComponent = addressComponents.find(c => c.types.includes('administrative_area_level_1'));
            const uf = stateComponent ? stateComponent.short_name : null;
            
            if (uf) {
                salvarIrradiacaoPorEstado(uf);
            } else {
                 if (resultSolarDiv) resultSolarDiv.style.display = 'none';
                 showAppToast("Não foi possível identificar o estado para este endereço.", "warning");
            }
        } else {
            showAppToast('Endereço não encontrado. Verifique os dados.', 'error');
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    initMapApp();
});