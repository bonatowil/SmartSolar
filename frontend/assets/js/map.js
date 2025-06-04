// ../assets/js/map.js
document.addEventListener('DOMContentLoaded', function () {
    const loadMapBtn = document.getElementById('load-map-btn');
    const addressInput = document.getElementById('address');
    const mapPlaceholder = document.getElementById('map-placeholder');
    const mapDiv = document.getElementById('map');

    const loadingSpinner = document.getElementById('loading-spinner');
    const searchIcon = document.getElementById('search-icon');
    const buttonText = document.getElementById('button-text');

    let map = null;
    let drawnItems = null;

    function initializeMap(lat, lon) {
        // Limpa a área desenhada anterior do localStorage ao inicializar/reposicionar o mapa
        localStorage.removeItem('areaDesenhada'); 
        // Ou, se preferir, localStorage.setItem('areaDesenhada', '0');
        
        // Atualiza o campo de resultado da área para "-- m²" se ele existir nesta página
        const resultAreaElement = document.getElementById('result-area');
        if (resultAreaElement) {
            resultAreaElement.textContent = '-- m²';
        }


        if (map) {
            map.setView([lat, lon], 18); // Aumentei o zoom para melhor visualização de telhados
            return;
        }

        mapPlaceholder.style.display = 'none';
        mapDiv.style.display = 'block';
        map = L.map('map').setView([lat, lon], 18);

        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
            maxZoom: 20 // Aumentado para permitir mais zoom em imagens de satélite
        }).addTo(map);

        drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        const drawControl = new L.Control.Draw({
            edit: { featureGroup: drawnItems },
            draw: {
                polygon: {
                    allowIntersection: false,
                    shapeOptions: { color: '#38A169' } // Verde para o polígono
                },
                rectangle: { shapeOptions: { color: '#38A169' } },
                polyline: false,
                circle: false,
                marker: false,
                circlemarker: false
            }
        });
        map.addControl(drawControl);

        map.on(L.Draw.Event.CREATED, function (event) {
            const layer = event.layer;
            drawnItems.clearLayers();
            drawnItems.addLayer(layer);

            const area = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
            console.log(`Área desenhada (map.js): ${area.toFixed(2)} m²`);

            // SALVA A ÁREA NO LOCALSTORAGE para calc.js usar
            localStorage.setItem('areaDesenhada', area.toFixed(2));

            // Atualiza o campo de resultado da área (se ele estiver visível e for parte desta UI)
            // O calc.js também fará isso quando exibir os resultados completos.
            if (resultAreaElement && document.getElementById('results-section') && document.getElementById('results-section').style.display === 'block') {
                 resultAreaElement.textContent = `${area.toFixed(2)} m²`;
            }
            alert(`Área selecionada: ${area.toFixed(2)} m². Agora preencha os outros dados e clique em "Calcular Potencial Solar".`);
        });
    }

    function isCep(value) {
        return /^\d{5}-?\d{3}$/.test(value);
    }

    function setButtonLoadingState(isLoading) {
        if (!loadMapBtn) return; // Garante que o botão existe
        loadMapBtn.disabled = isLoading;
        if (isLoading) {
            if(searchIcon) searchIcon.style.display = 'none';
            if(buttonText) buttonText.textContent = 'Carregando...';
            if(loadingSpinner) loadingSpinner.classList.remove('hidden');
        } else {
            if(searchIcon) searchIcon.style.display = 'inline-block'; // Ou 'block' dependendo do seu CSS
            if(buttonText) buttonText.textContent = 'Carregar Endereço no Mapa';
            if(loadingSpinner) loadingSpinner.classList.add('hidden');
        }
    }

    if (loadMapBtn) {
        loadMapBtn.addEventListener('click', async () => {
            const inputValue = addressInput.value.trim();
            if (!inputValue) {
                alert('Por favor, insira um CEP ou endereço.');
                return;
            }
            setButtonLoadingState(true);
            try {
                if (isCep(inputValue)) {
                    const cep = inputValue.replace('-', '');
                    // Lembre-se de adicionar a lógica de autenticação aqui se o endpoint /calculo/endereco for protegido
                    // Por exemplo, usando Basic Auth como nos outros scripts:
                    const email = localStorage.getItem('userEmail');
                    const password = localStorage.getItem('userPassword');
                    let authHeaderLocal = '';
                    if (email && password) {
                        authHeaderLocal = 'Basic ' + btoa('admin:admin');
                    } else {
                        // Considerar alertar ou impedir se a autenticação for estritamente necessária
                        console.warn("Credenciais não encontradas para buscar CEP, tentando como público.");
                    }

                    const response = await fetch(
                        `http://localhost:8080/calculo/endereco?cep=${encodeURIComponent(cep)}`, {
                            headers: {
                                'Content-Type': 'application/json',
                                ...(authHeaderLocal && { 'Authorization': authHeaderLocal }) // Adiciona Authorization se existir
                            }
                        }
                    );

                    if (response.status === 200) {
                        const data = await response.json();
                        if (data.latitude == null || data.longitude == null) { // Verifica por null ou undefined
                            alert('A API não retornou latitude/longitude para o CEP informado. Tentando busca por endereço...');
                            await buscarPorEnderecoCompleto(inputValue); // Tenta como endereço completo
                        } else {
                            console.log(`CEP encontrado: Lat ${data.latitude}, Lon ${data.longitude}`);
                            initializeMap(data.latitude, data.longitude);
                        }
                    } else if (response.status === 404) {
                        alert('CEP não encontrado. Tentando busca por endereço completo...');
                        await buscarPorEnderecoCompleto(inputValue); // Tenta como endereço completo
                    } else {
                        alert(`Erro ao buscar CEP (status ${response.status}). Tente o endereço completo.`);
                    }
                } else {
                    await buscarPorEnderecoCompleto(inputValue);
                }
            } catch (error) {
                console.error('Erro no processo de carregar mapa:', error);
                alert('Ocorreu um erro ao processar o endereço. Verifique os dados e sua conexão.');
            } finally {
                setButtonLoadingState(false);
            }
        });
    } else {
        console.warn("Botão 'load-map-btn' não encontrado.");
    }

    async function buscarPorEnderecoCompleto(endereco) {
        const provider = new GeoSearch.OpenStreetMapProvider();
        try {
            const results = await provider.search({ query: endereco });
            if (results && results.length > 0) {
                const { y: lat, x: lon } = results[0];
                console.log(`Endereço encontrado via GeoSearch: Lat ${lat}, Lon ${lon}`);
                initializeMap(lat, lon);
            } else {
                alert('Endereço não encontrado. Tente ser mais específico ou verifique o CEP.');
            }
        } catch (error) {
            console.error('Erro ao buscar endereço via GeoSearch:', error);
            alert('Ocorreu um erro ao buscar o endereço. Verifique sua conexão.');
        }
    }
});