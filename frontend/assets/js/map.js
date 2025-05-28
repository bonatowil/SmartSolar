
// Variável global para o mapa e camada de desenho
let map;
let drawnItems;

// 1. Inicializa o Mapa (função a ser chamada)
function initializeMap(lat = -23.5505, lon = -46.6333) { // Padrão: São Paulo
    // Se o mapa já existe, remove-o antes de criar um novo
    if (map) {
        map.remove();
    }

    const mapContainer = document.getElementById('map-container');
    mapContainer.innerHTML = ''; // Limpa qualquer placeholder

    map = L.map('map-container').setView([lat, lon], 17); // Nível de zoom 17 (rua/bairro)

    // 2. Adiciona a Camada Base (OpenStreetMap)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // 3. Adiciona a Camada de Desenho
    drawnItems = new L.FeatureGroup();
    map.addLayer(drawnItems);

    // 4. Adiciona os Controles de Desenho
    const drawControl = new L.Control.Draw({
        edit: {
            featureGroup: drawnItems, // Permite editar/deletar
            remove: true
        },
        draw: {
            polygon: { // Permite desenhar polígonos
                allowIntersection: false,
                shapeOptions: {
                    color: '#007bff' // Cor azul
                }
            },
            // Desabilita outras ferramentas de desenho
            polyline: false,
            rectangle: true, // Pode ser útil também
            circle: false,
            marker: false,
            circlemarker: false
        }
    });
    map.addControl(drawControl);

    // 5. Evento: Quando um desenho é criado
    map.on(L.FeatureGroup.Draw.Event.CREATED, function (event) {
        const layer = event.layer;
        drawnItems.addLayer(layer); // Adiciona ao grupo
        console.log("Desenho criado!", layer.toGeoJSON()); // Veja no console os dados

        // --- AQUI VOCÊ CALCULARIA A ÁREA ---
        // Leaflet não tem cálculo de área direto em metros^2, 
        // pode precisar de libs como 'turf.js' ou enviar 
        // as coordenadas (layer.getLatLngs()) para o backend calcular.
        // Para um polígono simples:
        try {
            const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
            console.log("Área estimada (m²):", area.toFixed(2));
            // Você pode exibir isso em algum lugar ou usar para o cálculo
        } catch (e) {
            console.error("Erro ao calcular área:", e);
        }
        // --- FIM CÁLCULO ÁREA ---
    });
    // Adiciona um marcador no local encontrado
    L.marker([lat, lon]).addTo(map)
        .bindPopup('Endereço Aproximado.')
        .openPopup();
}

// 6. Geocodificação (Usando Nominatim via Fetch)
async function geocodeAddress(address) {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;

    try {
        const response = await fetch(url, { headers: { 'Accept': 'application/json' } });
        if (!response.ok) {
            throw new Error(`Erro na busca: ${response.statusText}`);
        }
        const data = await response.json();

        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            console.log(`Endereço encontrado: Lat ${lat}, Lon ${lon}`);
            initializeMap(parseFloat(lat), parseFloat(lon)); // Inicializa/move o mapa
        } else {
            alert("Endereço não encontrado. Tente ser mais específico.");
            if (!map) initializeMap(); // Se não achou, mostra mapa padrão
        }
    } catch (error) {
        console.error("Erro ao geocodificar:", error);
        alert("Ocorreu um erro ao buscar o endereço. Tente novamente.");
        if (!map) initializeMap(); // Se deu erro, mostra mapa padrão
    }
}

// 7. Evento do Botão "Carregar Endereço"
document.getElementById('load-map-btn').addEventListener('click', function () {
    const addressInput = document.getElementById('address');
    if (addressInput.value) {
        geocodeAddress(addressInput.value);
    } else {
        alert("Por favor, digite um endereço.");
        if (!map) initializeMap(); // Se não digitou, mostra mapa padrão
    }
});

// 8. Evento do Botão "Calcular" (Adapte conforme sua lógica)
document.getElementById('calculate-btn').addEventListener('click', function () {
    // Verifique se há algum desenho na camada 'drawnItems'
    if (drawnItems.getLayers().length === 0) {
        alert("Por favor, desenhe a área do telhado no mapa antes de calcular.");
        return; // Para a execução se nada foi desenhado
    }

    // Pega o primeiro (ou único) polígono desenhado
    const polygonLayer = drawnItems.getLayers()[0];
    const coordinates = polygonLayer.toGeoJSON(); // Dados GeoJSON
    const avgBill = document.getElementById('avg-bill').value;

    console.log("Calculando com:", coordinates, "e Gasto Médio:", avgBill);

    // --- AQUI VOCÊ CHAMARIA SEU BACKEND JAVA ---
    // Ex: fetch('/api/calcular', { 
    //      method: 'POST', 
    //      headers: {'Content-Type': 'application/json'},
    //      body: JSON.stringify({ geojson: coordinates, gastoMedio: avgBill }) 
    // })
    // .then(response => response.json())
    // .then(data => { /* Atualiza os resultados na tela */ });
    // --- FIM CHAMADA BACKEND ---

    // ** Simulação (igual ao código anterior) **
    document.getElementById('result-area').textContent = 'XXX m²'; // Atualize com a área real
    document.getElementById('result-panels').textContent = 'YY';
    document.getElementById('result-cost').textContent = 'R$ ZZZ';
    document.getElementById('result-roi').textContent = 'W anos';

    const resultsSection = document.getElementById('results-section');
    resultsSection.style.display = 'block';
    resultsSection.scrollIntoView({ behavior: 'smooth' });
});

// Inicializa o mapa com a localização padrão quando a página carrega
window.onload = function () {
    initializeMap();
};