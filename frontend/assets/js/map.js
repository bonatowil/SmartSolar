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

            estimateSolarPotentialFromPolygon(polygon, area);
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

/**
 * estimateSolarPotentialFromPolygon
 * Chama a Solar API (endpoint buildingInsights) no ponto médio do polígono
 * e retorna uma estimativa de energia gerada em kWh por ano, dado:
 *   - areaEmM2: área total que o usuário desenhou (em m²);
 *   - eficienciaPainel: valor informado pelo usuário (e.g. 0.18 para 18%);
 *   - potenciaPainel: potência informada (e.g. 450 W). 
 * 
 * Nesta amostra, assumimos que o usuário já preencheu um formulário em que indicou
 * “eficiência” e “potência” (em W ou kW) do painel. Você precisará adaptar para buscar esses valores.
 */
async function estimateSolarPotentialFromPolygon(polygon, areaEmM2) {
    // 1) Busca ponto médio do polígono para consultar a Solar API
    //    Neste exemplo, vamos simplesmente pegar o "centro geométrico" do caminho.
    const bounds = new google.maps.LatLngBounds();
    polygon.getPath().forEach((latLng) => bounds.extend(latLng));
    const center = bounds.getCenter(); // google.maps.LatLng
    const lat = center.lat();
    const lng = center.lng();

    // 2) Monta a URL para chamar o endpoint buildingInsights:
    //    https://maps.googleapis.com/maps/api/solar/v1/buildingInsights
    const apiKey = 'AIzaSyA8XZY4V7HchLIebHUzYr9Y5_xLOiKPTYg';
    const url = `https://maps.googleapis.com/maps/api/solar/v1/buildingInsights` +
                `?location=${lat},${lng}` +
                `&key=${apiKey}`;

    try {
        // 3) Chama a Solar API via fetch
        const response = await fetch(url, {
            method: 'GET'
        });
        if (!response.ok) {
            throw new Error(`Erro Solar API: ${response.status}`);
        }
        const json = await response.json();

        // 4) Extrai o annualInsolation (kWh/m²/ano). No JSON de retorno:
        //    json.solarIrradiation.annualInsolation
        const annualInsolation = json?.solarIrradiation?.annualInsolation;
        if (annualInsolation == null) {
            throw new Error('Solar API não retornou um valor annualInsolation esperado.');
        }

        // 5) Agora, supondo que o formulário do usuário tenha campos para eficiência e potencia:
        //    Adaptar de acordo com seu HTML/Form. Exemplo:
        // const eficienciaInput = document.getElementById('input-eficiencia'); // ex.: "18" para 18%
        // const potenciaInput   = document.getElementById('input-potencia');   // ex.: "450" para 450 W
        const eficienciaInput = '18'; // ex.: "18" para 18%
        const potenciaInput   = '450';   // ex.: "450" para 450 W

        // Transforma no formato decimal (ex: 18 -> 0.18; 450 W -> 0.45 kW)
        let eficiencia = parseFloat(eficienciaInput?.value) / 100; // ex: 0.18
        let potenciaW  = parseFloat(potenciaInput?.value);        // ex: 450
        const potencia_kW = potenciaW / 1000;                      // ex: 0.45 kW

        if (isNaN(eficiencia) || isNaN(potenciaW)) {
            showAppToast('Eficiência ou Potência inválida. Verifique os valores.', 'error');
            return;
        }

        // 6) Cálculo aproximado da energia anual:
        //    energiaAnual (kWh) ≈ annualInsolation (kWh/m²/ano) × areaEmM2 (m²) × eficiência média × (potência do módulo em kW / 1 kW médio de referência)
        //
        //    A lógica exata do dimensionamento de sistemas costuma ser:
        //      - annualInsolation (kWh/m²) × área (m²) = energia teórica no telhado (kWh/ano)
        //      - multiplicar pela eficiência média do módulo (i.e. 0.18 → 18%)
        //      - ajustar perdas de inversor, cabos, sujeira (tipicamente 0.8 ~ 0.9 de fator de perdas). 
        //    Também se divide pela potência STC de referência de 1 kW-pico (mas, como o dado JSON já retorna em kWh/m², usar somente “eficiência” costuma bastar).
        //
        //    Para simplificar, vamos assumir fator de perdas de 0.85. Você pode parametrizar isso depois.
        const fatorPerdas = 0.85;

        // Energia anual aproximada em kWh (para todos os painéis que ocupam exatamente areaEmM2):
        const energiaTeorica = annualInsolation * areaEmM2 * eficiencia * fatorPerdas;
        // Se quiser ajustar pelo número de painéis ou potência nominal:
        //   numPainéis = areaEmM2 / areaPorPainel (m²/painel) 
        //   totalPotência_instalada_kW = numPainéis × potencia_kW
        //
        // Mas vamos supor que “areaEmM2” já é exatamente a área que cobre os painéis.

        // 7) Formata resultados e exibe na tela:
        const energiaFormatted = energiaTeorica.toFixed(2); // ex: “12500.34 kWh/ano”
        // Exemplo: mostra em algum elemento:
        const resultSolarElement = document.getElementById('result-solar');
        if (resultSolarElement) {
            resultSolarElement.textContent = `${energiaFormatted} kWh/ano (estimado)`;
        }

        showAppToast(`Estimativa anual: ${energiaFormatted} kWh/ano.`, 'success');
    }
    catch (err) {
        console.error(err);
        showAppToast('Erro ao obter dados de potencial solar.', 'error');
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