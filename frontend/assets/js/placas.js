// ../assets/js/placas.js

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.getElementById('productGrid');
    const noResultsDiv = document.getElementById('noResults');
    const searchInput = document.getElementById('searchInput');

    // API_BASE_URL é necessário aqui novamente
    const API_BASE_URL = 'http://localhost:8080';

    function debounce(func, delay = 300) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
    }

    async function buscarPlacas(filtros = {}) {
        try {
            // 1. Pega as credenciais do localStorage
            const email = localStorage.getItem('userEmail');
            const password = localStorage.getItem('userPassword');

            // 2. Verifica se o usuário está "logado" (tem credenciais salvas)
            if (!email || !password) {
                console.warn('Usuário não autenticado. Redirecionando para login.');
                // Mostra mensagem e talvez redirecione ou impeça a busca
                productGrid.innerHTML = `<p class="text-orange-500 text-center col-span-full">Você precisa estar logado para ver as placas. <a href="index.html" class="underline">Faça o login aqui.</a></p>`;
                noResultsDiv.style.display = 'none';
                productGrid.style.display = 'grid'; // Para a mensagem ser visível
                return; // Interrompe a função
            }

            // 3. Cria o cabeçalho de autenticação Basic


            // 4. Constrói a URL com os filtros
            let endpointPath = '/placa/';
            const queryParams = new URLSearchParams();
            if (filtros.termoBusca && filtros.termoBusca.trim() !== '') {
                const termo = filtros.termoBusca.trim();
                queryParams.append('marca', termo);
                queryParams.append('modelo', termo);
                queryParams.append('descricao', termo);
            }
            if (queryParams.toString()) {
                endpointPath += `?${queryParams.toString()}`;
            }
            const fullUrl = `${API_BASE_URL}${endpointPath}`;

            console.log(`Buscando placas em: ${fullUrl}`);

            // 5. Faz a chamada fetch com o cabeçalho de autenticação
            const response = await fetch(fullUrl, {
                method: 'GET',
                headers: {
                    'Authorization': 'Basic ' + btoa('admin:admin'),
                    
                }
            });

            // 6. Trata a resposta
            if (!response.ok) {
                if (response.status === 401) {
                    // Se deu 401 mesmo enviando o header, as credenciais podem ser inválidas/expiradas
                    // Limpa credenciais potencialmente ruins e avisa o usuário
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userPassword');
                    localStorage.removeItem('usuarioId'); // Se você também salvou o ID
                    alert('Sua sessão expirou ou as credenciais são inválidas. Por favor, faça login novamente.');
                    window.location.href = 'index.html'; // Redireciona para o login
                    throw new Error('Não autorizado (401)'); // Para a execução
                }
                throw new Error(`Erro na API: ${response.status}`);
            }

            const placas = await response.json();

            productGrid.innerHTML = ''; 

            if (!placas || placas.length === 0) {
                noResultsDiv.style.display = 'block';
                productGrid.style.display = 'none';
                if (filtros.termoBusca && filtros.termoBusca.trim() !== '') {
                     noResultsDiv.querySelector('p').textContent = 'Nenhum produto encontrado com os filtros selecionados.';
                } else {
                     noResultsDiv.querySelector('p').textContent = 'Nenhuma placa cadastrada no momento.';
                }
            } else {
                noResultsDiv.style.display = 'none';
                productGrid.style.display = 'grid';
                placas.forEach(placa => {
                    const marca = placa.marca || 'Marca não informada';
                    const modelo = placa.modelo || 'Tipo não especificado';
                    const descricao = placa.descricao || 'Descrição não disponível.';
                    const preco = typeof placa.preco === 'number' ? placa.preco.toFixed(2) : 'N/A';
                    const imagemSrc = '../assets/images/'

                    const cardHtml = `
                        <div class="product-card bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700 flex flex-col">
                            <img src="${imagemSrc}" alt="${modelo}" class="w-full h-48 object-cover">
                            <div class="p-5 flex flex-col flex-grow">
                                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">${marca}</h3>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-3">${modelo}</p>
                                <p class="text-gray-700 dark:text-gray-300 mb-4 flex-grow text-sm leading-relaxed">
                                    ${descricao}
                                </p>
                                <div class="flex justify-between items-center mt-auto pt-3 border-t dark:border-gray-700">
                                    <span class="text-xl font-bold text-green-600 dark:text-green-500">R$ ${preco}</span>
                                    <a href="#" class="text-white bg-green-500 hover:bg-green-600 font-medium px-4 py-2 rounded-md text-sm">
                                        Detalhes
                                    </a>
                                </div>
                            </div>
                        </div>
                    `;
                    productGrid.innerHTML += cardHtml;
                });
            }
        } catch (error) {
            console.error('Falha ao buscar placas:', error);
            // Não mostra a mensagem no grid se o erro foi por não estar logado (já tratado acima)
            // ou se foi redirecionado por 401.
            if (error.message !== 'Não autorizado (401)' && !productGrid.querySelector('p.text-orange-500')) {
                 productGrid.innerHTML = `<p class="text-red-500 text-center col-span-full">Falha ao buscar placas: ${error.message}</p>`;
                 noResultsDiv.style.display = 'block';
                 noResultsDiv.querySelector('p').textContent = `Erro ao carregar produtos: ${error.message}`;
                 productGrid.style.display = 'none';
            }
        }
    }

    function handleFilterChange() {
        const termoBusca = searchInput.value.trim();
        buscarPlacas({ termoBusca: termoBusca });
    }

    if (searchInput) {
        searchInput.addEventListener('input', debounce(handleFilterChange, 300));
    } else {
        console.warn('Elemento #searchInput não encontrado na página.');
    }
    
    buscarPlacas(); // Carga inicial
});