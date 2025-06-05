// ../assets/js/map.js

let map;
let drawingManager;
let geocoder;
let lastPolygon = null; // Para rastrear o último polígono desenhado

const loadMapBtn = document.getElementById('load-map-btn');
const addressInput = document.getElementById('address');
const mapPlaceholder = document.getElementById('map-placeholder');
const mapDiv = document.getElementById('map');
const loadingSpinner = document.getElementById('loading-spinner');
const searchIcon = document.getElementById('search-icon');
const buttonText = document.getElementById('button-text');

// Referência para a área nos resultados principais da simulação
const resultAreaElement = document.getElementById('result-area');
const deleteAreaBtn = document.getElementById('delete-area-btn');

// NOVAS CONSTANTES para a exibição da área desenhada abaixo do mapa
const drawnAreaDisplayContainer = document.getElementById('drawn-area-display');
const mapDrawnAreaValue = document.getElementById('map-drawn-area-value');

function initMapApp() {
    geocoder = new google.maps.Geocoder();
    console.log("Google Maps API carregada e pronta.");

    if (loadMapBtn) {
        loadMapBtn.addEventListener('click', handleLoadMapClick);
    } else {
        console.warn("Botão 'load-map-btn' não encontrado.");
    }

    if (deleteAreaBtn) {
        deleteAreaBtn.addEventListener('click', handleDeleteDrawnArea);
    } else {
        console.warn("Botão 'delete-area-btn' não encontrado.");
    }
}

function handleDeleteDrawnArea() {
    if (lastPolygon) {
        lastPolygon.setMap(null);
        lastPolygon = null;
        localStorage.removeItem('areaDesenhada');

        if (resultAreaElement) {
            resultAreaElement.textContent = '-- m²';
        }
        // ATUALIZADO: Resetar a exibição da área desenhada abaixo do mapa
        if (mapDrawnAreaValue) {
            mapDrawnAreaValue.textContent = '-- m²';
        }
        if (drawnAreaDisplayContainer) {
            drawnAreaDisplayContainer.style.display = 'none';
        }

        showAppToast('Área removida.', 'success'); // Mantido 'success' conforme seu script
        if (deleteAreaBtn) {
            deleteAreaBtn.style.display = 'none';
        }
    } else {
        showAppToast('Nenhuma área para excluir.', 'error'); // Mantido 'error'
    }
}


function initializeMap(lat, lng) {
    // Resetar localStorage e elementos de exibição de área
    localStorage.removeItem('areaDesenhada');
    if (resultAreaElement) {
        resultAreaElement.textContent = '-- m²';
    }
    if (deleteAreaBtn) {
        deleteAreaBtn.style.display = 'none';
    }
    // ATUALIZADO: Resetar a nova exibição da área desenhada abaixo do mapa
    if (mapDrawnAreaValue) {
        mapDrawnAreaValue.textContent = '-- m²';
    }
    if (drawnAreaDisplayContainer) {
        drawnAreaDisplayContainer.style.display = 'none';
    }

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

    if (!map) { // Se o mapa não foi inicializado ainda
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

            console.log(`Área desenhada (map.js - Google): ${areaFormatted} m²`);
            localStorage.setItem('areaDesenhada', areaFormatted);

            // Atualiza a área nos resultados principais (se a seção estiver visível)
            if (resultAreaElement && document.getElementById('results-section') && document.getElementById('results-section').style.display !== 'none') {
                resultAreaElement.textContent = `${areaFormatted} m²`;
            }

            // ATUALIZADO: Atualizar e mostrar a exibição da área desenhada abaixo do mapa
            if (mapDrawnAreaValue) {
                mapDrawnAreaValue.textContent = `${areaFormatted} m²`;
            }
            if (drawnAreaDisplayContainer) {
                drawnAreaDisplayContainer.style.display = 'block'; // Ou 'flex' se for um container flex
            }

            showAppToast(`Área selecionada: ${areaFormatted} m². Preencha os outros dados e calcule.`, 'success', 6000); // Duração um pouco maior

            if (deleteAreaBtn) {
                deleteAreaBtn.style.display = 'flex';
            }

            drawingManager.setDrawingMode(null);
        });

    } else { // Se o mapa já existe, apenas reposiciona e define zoom
        map.setCenter({ lat: lat, lng: lng });
        map.setZoom(18);
        if (lastPolygon) { // Limpa polígono anterior se o mapa for recentralizado
            lastPolygon.setMap(null);
            lastPolygon = null;
            // Os resets de localStorage e display elements já são feitos no topo de initializeMap
            // e serão re-executados implicitamente se esta função for chamada para um novo endereço.
            // Mas, para garantir que a área abaixo do mapa seja limpa se apenas recentralizarmos
            // sem redesenhar, adicionamos explicitamente aqui também.
            if (mapDrawnAreaValue) mapDrawnAreaValue.textContent = '-- m²';
            if (drawnAreaDisplayContainer) drawnAreaDisplayContainer.style.display = 'none';
            if (deleteAreaBtn) deleteAreaBtn.style.display = 'none'; // Garante que o botão suma também
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
        if (buttonText) buttonText.textContent = 'Buscar Endereço'; // Mantido "Buscar Endereço"
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
                    console.log(`CEP encontrado: Lat ${data.latitude}, Lon ${data.longitude}`);
                    initializeMap(parseFloat(data.latitude), parseFloat(data.longitude));
                } else {
                    showAppToast('A API não retornou latitude/longitude para o CEP. Tentando busca por endereço...', 'warning');
                    await buscarPorEnderecoCompletoGoogle(inputValue);
                }
            } else if (response.status === 404) {
                showAppToast('CEP não encontrado em nossa base. Tentando busca por endereço no Google...', 'error');
                await buscarPorEnderecoCompletoGoogle(inputValue);
            } else {
                showAppToast(`Erro ao buscar CEP (status ${response.status}). Tente o endereço completo.`, 'error');
            }
        } else {
            await buscarPorEnderecoCompletoGoogle(inputValue);
        }
    } catch (error) {
        console.error('Erro no processo de carregar mapa:', error);
        showAppToast('Ocorreu um erro ao processar o endereço. Verifique os dados e sua conexão.', 'error');
    } finally {
        setButtonLoadingState(false);
    }
}

async function buscarPorEnderecoCompletoGoogle(endereco) {
    if (!geocoder) {
        console.error("Geocoder não inicializado. A API do Google Maps pode não ter carregado.");
        showAppToast("Erro: Serviço de geocodificação não está pronto. Tente novamente.", 'error');
        return Promise.reject("Geocoder not initialized");
    }
    return new Promise((resolve, reject) => {
        geocoder.geocode({ 'address': endereco }, (results, status) => {
            if (status === 'OK' && results[0]) {
                const location = results[0].geometry.location;
                const lat = location.lat();
                const lng = location.lng();
                console.log(`Endereço encontrado via Google Geocoder: Lat ${lat}, Lon ${lng}`);
                initializeMap(lat, lng);
                resolve({ lat, lng });
            } else {
                console.warn('Geocode não foi bem-sucedido pelo seguinte motivo: ' + status);
                showAppToast('Endereço não encontrado pelo Google Maps. Tente ser mais específico ou verifique o CEP.', 'error');
                reject(new Error('Geocoding failed: ' + status));
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM carregado. Aguardando API do Google Maps...");
    // A função initMapApp() é chamada pelo callback da API do Google Maps
});