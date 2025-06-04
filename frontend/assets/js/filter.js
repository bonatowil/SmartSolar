// ../assets/js/filter.js (ou placas.js)

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter'); // Mantemos, mas o filtro será no frontend
    const noResultsDiv = document.getElementById('noResults'); // Supondo que você tenha este div no HTML

    const API_BASE_URL = 'http://localhost:8080';

    let todosOsProdutosDaAPI = []; // Vamos guardar os produtos da API aqui para filtrar por categoria no frontend

    function debounce(func, delay = 300) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    // Função para renderizar os produtos na tela (igual à sua, mas adaptada para os dados da API)
    function renderProducts(listaDePlacas) {
        productGrid.innerHTML = ''; // Limpa a grade

        if (!listaDePlacas || listaDePlacas.length === 0) {
            if(noResultsDiv) noResultsDiv.style.display = 'block';
            if(productGrid) productGrid.style.display = 'none';
            // Ajusta a mensagem se já houver termo de busca ou categoria
            const searchTerm = searchInput.value.trim();
            const category = categoryFilter.value;
            if ((searchTerm || category) && noResultsDiv && noResultsDiv.querySelector('p')) {
                 noResultsDiv.querySelector('p').textContent = 'Nenhum produto encontrado com os filtros selecionados.';
            } else if (noResultsDiv && noResultsDiv.querySelector('p')) {
                 noResultsDiv.querySelector('p').textContent = 'Nenhuma placa cadastrada no momento.';
            }
            return;
        }

        if(noResultsDiv) noResultsDiv.style.display = 'none';
        if(productGrid) productGrid.style.display = 'grid';

        listaDePlacas.forEach(placa => {
            const card = document.createElement('div');
            // Adapte as classes conforme necessário para o seu layout Tailwind
            card.className = 'product-card bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col';
            
            // Ajuste os nomes dos campos para corresponderem aos dados da SUA API
            const nomeCompleto = `${placa.marca || ''} ${placa.modelo || 'Produto Solar'}`.trim();
            const imagem = '../assets/images/imagem-padrao-placa.jpg'; 
            const descricao = placa.descricao || 'Descrição não disponível.';
            const precoFormatado = typeof placa.preco === 'number' ? `R$ ${placa.preco.toFixed(2)}` : 'Preço indisponível';
            const categoriaPlaca = placa.tipo || 'Não especificado'; // Usando 'tipo' da API como categoria

            card.innerHTML = `
                <img src="${imagem}" alt="${nomeCompleto}" class="h-48 w-full object-cover">
                <div class="p-5 flex-1 flex flex-col justify-between">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1">${nomeCompleto}</h3>
                        <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Categoria: ${categoriaPlaca}</p>
                        <p class="text-sm text-gray-700 dark:text-gray-300 mb-4 flex-grow">${descricao}</p>
                    </div>
                    <div class="flex items-center justify-between mt-auto pt-3 border-t dark:border-gray-700">
                        <span class="font-bold text-xl text-green-600 dark:text-green-500">${precoFormatado}</span>
                        <button class="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md text-sm">Detalhes</button>
                    </div>
                </div>
            `;
            productGrid.appendChild(card);
        });
    }

    // Função para buscar placas da API E aplicar filtros de frontend
    async function buscarEFiltrarPlacas() {
        const termoBuscaAPI = searchInput.value.trim(); // O que será enviado para a API
        const categoriaFrontend = categoryFilter.value; // O que será usado para filtrar no frontend

        try {
            const email = localStorage.getItem('userEmail');
            const password = localStorage.getItem('userPassword');

            if (!email || !password) {
                // Tratar caso de não estar logado
                productGrid.innerHTML = `<p class="text-orange-500 text-center col-span-full">Você precisa estar logado para ver as placas. <a href="index.html" class="underline">Faça o login aqui.</a></p>`;
                if(noResultsDiv) noResultsDiv.style.display = 'none';
                if(productGrid) productGrid.style.display = 'grid';
                return;
            }

        

            let endpointPath = '/placa/';
            const queryParams = new URLSearchParams();

            // A API aceita marca, modelo, descricao. Vamos enviar o termo de busca para todos.
            if (termoBuscaAPI) {
                queryParams.append('marca', termoBuscaAPI);
                queryParams.append('modelo', termoBuscaAPI);
                queryParams.append('descricao', termoBuscaAPI);
            }

            if (queryParams.toString()) {
                endpointPath += `?${queryParams.toString()}`;
            }
            const fullUrl = `${API_BASE_URL}${endpointPath}`;
            console.log(`Buscando placas em: ${fullUrl}`);

            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: { 
                    'Authorization': 'Basic ' + btoa('admin:admin'),
                    'Content-Type': 'application/json'
                 }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userPassword');
                    localStorage.removeItem('usuarioId');
                    alert('Sua sessão expirou ou as credenciais são inválidas. Por favor, faça login novamente.');
                    window.location.href = 'index.html';
                    throw new Error('Não autorizado (401)');
                }
                throw new Error(`Erro na API: ${response.status}`);
            }

            todosOsProdutosDaAPI = await response.json(); // Guarda todos os resultados da API (já filtrados pelo backend se termoBuscaAPI foi enviado)
            
            // Agora, aplica o filtro de categoria NO FRONTEND, se uma categoria foi selecionada
            let produtosParaRenderizar = todosOsProdutosDaAPI;
            if (categoriaFrontend) {
                produtosParaRenderizar = todosOsProdutosDaAPI.filter(prod => prod.tipo === categoriaFrontend);
            }
            
            renderProducts(produtosParaRenderizar);

        } catch (error) {
            console.error('Falha ao buscar ou filtrar placas:', error);
            if (error.message !== 'Não autorizado (401)' && (!productGrid.querySelector('p') || !productGrid.querySelector('p.text-orange-500'))) {
                productGrid.innerHTML = `<p class="text-red-500 text-center col-span-full">Falha ao buscar placas: ${error.message}</p>`;
                if(noResultsDiv) {
                    noResultsDiv.style.display = 'block';
                    if(noResultsDiv.querySelector('p')) {
                        noResultsDiv.querySelector('p').textContent = `Erro ao carregar produtos: ${error.message}`;
                    }
                }
                if(productGrid) productGrid.style.display = 'none';
           }
        }
    }

    // Eventos
    // Usamos debounce para a busca, para não sobrecarregar a API
    searchInput.addEventListener('input', debounce(buscarEFiltrarPlacas, 500)); 
    // O filtro de categoria não precisa de debounce, pois filtra dados já carregados (ou recarrega tudo)
    categoryFilter.addEventListener('change', buscarEFiltrarPlacas);

    // Render inicial - Busca todos os produtos da API
    buscarEFiltrarPlacas();
});