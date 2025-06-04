document.addEventListener('DOMContentLoaded', function () {
    const loadMapBtn = document.getElementById('load-map-btn');
    const addressInput = document.getElementById('address');
    const mapPlaceholder = document.getElementById('map-placeholder');
    const mapDiv = document.getElementById('map');

    // Elementos do botão para o estado de carregamento
    const loadingSpinner = document.getElementById('loading-spinner');
    const searchIcon = document.getElementById('search-icon');
    const buttonText = document.getElementById('button-text'); // Span que contém o texto do botão

    let map = null;         // Guarda instância do Leaflet
    let drawnItems = null;  // Guarda camada de desenho

    // Função que inicializa ou reposiciona o mapa
    function initializeMap(lat, lon) {
        if (map) {
            // Se já existe mapa, faz apenas setView para a nova coordenada
            map.setView([lat, lon], 17);
            return;
        }

        // Se ainda não existe mapa, esconde placeholder e mostra #map
        mapPlaceholder.style.display = 'none';
        mapDiv.style.display = 'block';

        // Cria o mapa apontando para [lat, lon], zoom 17
        map = L.map('map').setView([lat, lon], 17);

        // Adiciona camada de tile do OpenStreetMap
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 18 // Ou até mais, dependendo da região
        }).addTo(map);

        // Cria FeatureGroup para desenhos
        drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        // Configura controle de desenho (Leaflet.draw)
        const drawControl = new L.Control.Draw({
            edit: {
                featureGroup: drawnItems
            },
            draw: {
                polygon: true,
                polyline: false,
                rectangle: true,
                circle: false,
                marker: false,
                circlemarker: false
            }
        });
        map.addControl(drawControl);

        // Ao criar o desenho, limpa desenhos anteriores e calcula área
        map.on(L.Draw.Event.CREATED, function (event) {
            const layer = event.layer;
            drawnItems.clearLayers();
            drawnItems.addLayer(layer);

            // Calcula área em m²
            const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
            console.log(`Área desenhada: ${area.toFixed(2)} m²`);

            // Exibe resultado (supondo que exista #result-area e #results-section)
            document.getElementById('result-area').textContent = `${area.toFixed(2)} m²`;
            document.getElementById('results-section').style.display = 'block';
        });
    }

    // Regex para identificar CEP válido (8 dígitos com ou sem hífen)
    function isCep(value) {
        return /^\d{5}-?\d{3}$/.test(value);
    }

    // Função para controlar o estado de carregamento do botão
    function setButtonLoadingState(isLoading) {
        if (isLoading) {
            loadMapBtn.disabled = true;
            if(searchIcon) searchIcon.classList.add('hidden'); // Verifica se o elemento existe
            if(buttonText) buttonText.textContent = 'Carregando...'; // Altera o texto
            if(loadingSpinner) loadingSpinner.classList.remove('hidden');
        } else {
            loadMapBtn.disabled = false;
            if(searchIcon) searchIcon.classList.remove('hidden');
            if(buttonText) buttonText.textContent = 'Carregar Endereço no Mapa'; // Restaura o texto
            if(loadingSpinner) loadingSpinner.classList.add('hidden');
        }
    }

    loadMapBtn.addEventListener('click', async () => {
        const inputValue = addressInput.value.trim();
        if (!inputValue) {
            alert('Por favor, insira um CEP ou endereço.');
            return;
        }

        setButtonLoadingState(true); // MOSTRAR PROGRESSO

        try {
            // Se for CEP, chama a API interna; se não, faz GeoSearch por endereço
            if (isCep(inputValue)) {
                const cep = inputValue.replace('-', '');
                try {
                    const response = await fetch(
                        `http://localhost:8080/calculo/endereco?cep=${encodeURIComponent(cep)}`, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': 'Basic ' + btoa('admin:admin') // Cuidado com credenciais hardcoded em produção
                            }
                        }
                    );

                    if (response.status === 200) {
                        const data = await response.json();
                        const lat = data.latitude;
                        const lon = data.longitude;

                        if (lat == null || lon == null) {
                            alert('A API não retornou latitude/longitude para o CEP informado.');
                            // Não precisa de return aqui, o finally cuidará do botão
                        } else {
                            console.log(`CEP encontrado: Lat ${lat}, Lon ${lon}`);
                            initializeMap(lat, lon);
                        }
                    } else if (response.status === 404) {
                        alert('CEP não encontrado.');
                    } else if (response.status === 500) {
                        alert('Erro interno ao buscar pelas coordenadas (500).');
                    } else {
                        alert(`Erro inesperado ao buscar CEP (status ${response.status}). Tente novamente.`);
                    }
                } catch (error) {
                    console.error('Erro ao chamar API de CEP:', error);
                    alert('Ocorreu um erro ao buscar o CEP. Verifique sua conexão ou se o servidor local está rodando.');
                }
            } else {
                // Não é CEP: assume que é endereço completo e usa GeoSearch
                const provider = new GeoSearch.OpenStreetMapProvider();
                try {
                    const results = await provider.search({ query: inputValue });
                    if (results && results.length > 0) {
                        const { y: lat, x: lon } = results[0]; // y=latitude, x=longitude
                        console.log(`Endereço encontrado: Lat ${lat}, Lon ${lon}`);
                        initializeMap(lat, lon);
                    } else {
                        alert('Endereço não encontrado. Tente ser mais específico.');
                    }
                } catch (error) {
                    console.error('Erro ao buscar endereço via GeoSearch:', error);
                    alert('Ocorreu um erro ao buscar o endereço. Verifique sua conexão.');
                }
            }
        } finally {
            setButtonLoadingState(false); // ESCONDER PROGRESSO (SEMPRE)
        }
    });
});