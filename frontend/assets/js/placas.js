// ../assets/js/placas.js

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');
    const noResultsDiv = document.getElementById('noResults');
    const searchInput = document.getElementById('searchInput');
    const searchField = document.getElementById('searchField');

    const API_BASE_URL = 'http://localhost:8080';

    // Função para evitar chamadas excessivas à API enquanto o usuário digita
    function debounce(func, delay = 350) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // A função buscarPlacas permanece a mesma
    async function buscarPlacas(filtros = {}) {
        try {
            const email = localStorage.getItem('userEmail');
            const password = localStorage.getItem('userPassword');

            if (!email || !password) {
                productGrid.innerHTML = `<p class="text-orange-500 text-center col-span-full">Você precisa estar logado para ver as placas. <a href="index.html" class="underline">Faça o login aqui.</a></p>`;
                noResultsDiv.style.display = 'none';
                productGrid.style.display = 'grid';
                return;
            }

            let endpointPath = '/placa/';
            const queryParams = new URLSearchParams();

            if (filtros.term && filtros.field) {
                queryParams.append(filtros.field, filtros.term);
            }

            if (queryParams.toString()) {
                endpointPath += `?${queryParams.toString()}`;
            }

            const fullUrl = `${API_BASE_URL}${endpointPath}`;
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa('admin:admin'),
                }
            });

            if (!response.ok) {
                throw new Error(`Erro na API: ${response.status}`);
            }

            const placas = await response.json();
            productGrid.innerHTML = '';

            if (!placas || placas.length === 0) {
                noResultsDiv.style.display = 'block';
                productGrid.style.display = 'none';
                noResultsDiv.querySelector('p').textContent = filtros.term 
                    ? 'Nenhum produto encontrado com os filtros selecionados.'
                    : 'Nenhuma placa cadastrada no momento.';
            } else {
                noResultsDiv.style.display = 'none';
                productGrid.style.display = 'grid';
                placas.forEach(placa => {
                    const cardHtml = createModernCard(placa);
                    productGrid.innerHTML += cardHtml;
                });
            }
        } catch (error) {
            console.error('Falha ao buscar placas:', error);
            productGrid.innerHTML = `<p class="text-red-500 text-center col-span-full">Falha ao buscar placas: ${error.message}</p>`;
            noResultsDiv.style.display = 'block';
            noResultsDiv.querySelector('p').textContent = `Erro ao carregar produtos: ${error.message}`;
            productGrid.style.display = 'none';
        }
    }

    /**
     * ATUALIZADO: Cria o HTML para um card com botões de Ação (Editar/Excluir).
     * @param {object} placa - O objeto da placa vindo da API.
     * @returns {string} - O HTML do card.
     */
    function createModernCard(placa) {
        const marca = placa.marca || 'Marca não informada';
        const modelo = placa.modelo || 'Tipo não especificado';
        const descricao = placa.descricao || 'Sem descrição detalhada.';
        const preco = typeof placa.preco === 'number' ? placa.preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : 'N/A';
        const potencia = placa.potencia || 0;
        const area = placa.area || 0;
        const eficiencia = placa.eficiencia > 0 ? placa.eficiencia : (potencia / (area * 1000));
        const eficienciaPercent = (eficiencia * 100).toFixed(2);
        const dimensoes = `${placa.dimensaoX || 0} x ${placa.dimensaoY || 0} x ${placa.dimensaoZ || 0} mm`;

        // Converte o objeto da placa para uma string JSON segura para ser usada em um atributo HTML
        const placaInfoAttr = JSON.stringify(placa).replace(/'/g, '&apos;');

        return `
            <div class="product-card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col transition-transform duration-300 hover:scale-105 hover:shadow-2xl">
                
                <div class="p-5 border-b dark:border-gray-600 flex justify-between items-start">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900 dark:text-white truncate" title="${marca}">${marca}</h3>
                        <p class="text-md text-green-600 dark:text-green-400 font-semibold">${modelo}</p>
                    </div>
                    <div class="flex space-x-3">
                        <button title="Editar Placa" class="edit-btn text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 text-lg"
                                data-placa-info='${placaInfoAttr}'>
                            <i class="fas fa-pencil-alt fa-fw"></i>
                        </button>
                        <button title="Excluir Placa" class="delete-btn text-red-500 hover:text-red-700 dark:hover:text-red-400 text-lg"
                                data-placa-id="${placa.placaId}">
                            <i class="fas fa-trash-alt fa-fw"></i>
                        </button>
                    </div>
                </div>

                <div class="p-5 flex-grow">
                    <p class="text-gray-600 dark:text-gray-300 mb-6 text-sm leading-relaxed">${descricao}</p>
                    <div class="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div class="flex items-center" title="Potência"><i class="fas fa-bolt fa-fw mr-2 text-yellow-500"></i><span class="font-semibold text-gray-800 dark:text-gray-200">${potencia} Wp</span></div>
                        <div class="flex items-center" title="Eficiência"><i class="fas fa-leaf fa-fw mr-2 text-green-500"></i><span class="font-semibold text-gray-800 dark:text-gray-200">${eficienciaPercent}%</span></div>
                        <div class="flex items-center" title="Área"><i class="fas fa-vector-square fa-fw mr-2 text-blue-500"></i><span class="font-semibold text-gray-800 dark:text-gray-200">${area.toFixed(2)} m²</span></div>
                        <div class="flex items-center" title="Dimensões"><i class="fas fa-ruler-combined fa-fw mr-2 text-purple-500"></i><span class="font-semibold text-gray-800 dark:text-gray-200">${dimensoes}</span></div>
                    </div>
                </div>

                <div class="p-5 mt-auto border-t dark:border-gray-600">
                    <div class="flex justify-center items-center">
                        <span class="text-2xl font-bold text-gray-800 dark:text-white">${preco}</span>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * NOVO: Lida com o clique no botão de excluir.
     * @param {string} placaId - O ID da placa a ser excluída.
     */
    async function handleDelete(placaId) {
        if (!confirm('Tem certeza que deseja excluir esta placa? Esta ação não pode ser desfeita.')) {
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/placa/${placaId}`, {
                method: 'DELETE',
                headers: { 'Authorization': 'Basic ' + btoa('admin:admin') }
            });

            if (response.status === 204) {
                showAppToast('Placa excluída com sucesso!', 'success');
                // Remove o card da interface sem precisar recarregar a página
                const cardToRemove = productGrid.querySelector(`.delete-btn[data-placa-id='${placaId}']`).closest('.product-card');
                if (cardToRemove) {
                    cardToRemove.remove();
                }
            } else if (response.status === 404) {
                throw new Error('Placa não encontrada no servidor.');
            } else {
                throw new Error(`Erro ${response.status} ao excluir.`);
            }
        } catch (error) {
            console.error('Falha ao excluir placa:', error);
            showAppToast(`Erro: ${error.message}`, 'error');
        }
    }

    // A função de filtro permanece a mesma
    function handleFilterChange() {
        const termoBusca = searchInput.value.trim();
        const campoBusca = searchField.value;
        buscarPlacas({ field: campoBusca, term: termoBusca });
    }

    // Listeners para o filtro de busca
    if (searchInput && searchField) {
        searchInput.addEventListener('input', debounce(handleFilterChange, 350));
        searchField.addEventListener('change', handleFilterChange);
    } else {
        console.warn('Elementos de busca (#searchInput ou #searchField) não encontrados.');
    }
    
    /**
     * NOVO: Event Delegation para os botões de ação nos cards.
     * Escuta os cliques no grid de produtos e identifica se foi em um botão de editar ou excluir.
     */
    productGrid.addEventListener('click', (event) => {
        const button = event.target.closest('button'); // Encontra o botão mais próximo que foi clicado
        if (!button) return;

        // Se o botão for de exclusão
        if (button.classList.contains('delete-btn')) {
            const placaId = button.dataset.placaId;
            handleDelete(placaId);
        }

        // Se o botão for de edição
        if (button.classList.contains('edit-btn')) {
            // Pega a string de dados do atributo, converte de volta para um objeto
            const placaInfo = JSON.parse(button.dataset.placaInfo.replace(/&apos;/g, "'"));
            // Chama a função global (definida em cadastro_placa.js) para abrir o modal de edição
            if (typeof openModalForEdit === 'function') {
                openModalForEdit(placaInfo);
            } else {
                console.error('A função openModalForEdit não foi encontrada. Verifique se o script cadastro_placa.js está carregado.');
            }
        }
    });

    // Carga inicial de todas as placas
    buscarPlacas();
});