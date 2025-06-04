document.addEventListener('DOMContentLoaded', function () {
    const loadMapBtn = document.getElementById('load-map-btn');
    const addressInput = document.getElementById('address');
    const mapPlaceholder = document.getElementById('map-placeholder');
    const mapDiv = document.getElementById('map');
    
    let map = null; // Variável para guardar a instância do mapa
    let drawnItems = null; // Variável para as camadas de desenho

    // Função para inicializar o mapa
    function initializeMap(lat, lon) {
        // Se o mapa já foi inicializado, apenas muda a visão
        if (map) {
            map.setView([lat, lon], 17);
            return;
        }

        // Esconde o placeholder e mostra o div do mapa
        mapPlaceholder.style.display = 'none';
        mapDiv.style.display = 'block';

        // 1. CRIA O MAPA
        map = L.map('map').setView([lat, lon], 20); // 17 é o nível de zoom

        // 2. ADICIONA A CAMADA DE MAPA (TILES) - ESSENCIAL!
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // 3. ADICIONA OS CONTROLES DE DESENHO (LEAFLET.DRAW)
        drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

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

        // Evento para capturar a área desenhada
        map.on(L.Draw.Event.CREATED, function (event) {
            const layer = event.layer;
            drawnItems.clearLayers(); // Limpa desenhos anteriores
            drawnItems.addLayer(layer);

            // Calcula e exibe a área
            const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
            console.log(`Área desenhada: ${area.toFixed(2)} m²`);
            
            // Você pode colocar o resultado na sua seção de resultados aqui
            document.getElementById('result-area').textContent = `${area.toFixed(2)} m²`;
            document.getElementById('results-section').style.display = 'block';
        });
    }

    // Ação ao clicar no botão
    loadMapBtn.addEventListener('click', async () => {
        const address = addressInput.value;
        if (!address) {
            alert('Por favor, insira um endereço.');
            return;
        }

        // Usando o GeoSearch para encontrar o endereço
        const provider = new GeoSearch.OpenStreetMapProvider();
        
        try {
            const results = await provider.search({ query: address });
            
            if (results && results.length > 0) {
                const { y: lat, x: lon } = results[0]; // Pega latitude (y) e longitude (x)
                console.log(`Endereço encontrado: Lat ${lat}, Lon ${lon}`);
                initializeMap(lat, lon);
            } else {
                alert('Endereço não encontrado. Tente ser mais específico.');
            }
        } catch (error) {
            console.error('Erro ao buscar endereço:', error);
            alert('Ocorreu um erro ao buscar o endereço. Verifique sua conexão.');
        }
    });
});