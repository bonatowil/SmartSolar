
// Exemplo de dados de produtos
const products = [
{ id: 1, name: 'Placa Monocristalina A', category: 'Monocristalino', image: '/assets/images/Silício Monocristalino.jpeg', description: 'Alta eficiência e durabilidade.', price: 'R$ 300' },
{ id: 2, name: 'Placa Policristalina B', category: 'Policristalino', image: '/assets/images/Silício Policristalino.jpeg', description: 'Custo-benefício acessível.', price: 'R$ 250' },
{ id: 3, name: 'Placa Amorfa C', category: 'Amorfo', image: '/assets/images/Silício Amorfo.jpeg', description: 'Flexível e leve.', price: 'R$ 200' },
{ id: 4, name: 'Placa CdTe D', category: 'CdTe', image: '/assets/images/CdTe.jpeg', description: 'Bom desempenho em baixa luz.', price: 'R$ 280' },
{ id: 5, name: 'Placa CIGS E', category: 'CIGS', image: '/assets/images/CIGS.jpeg', description: 'Alta eficiência de filme fino.', price: 'R$ 320' },
{ id: 6, name: 'Placa OPV F', category: 'OPV', image: '/assets/images/OPV.jpeg', description: 'Orgânica e sustentável.', price: 'R$ 180' },
{ id: 7, name: 'Placa HJT G', category: 'HJT', image: '/assets/images/HJT.jpeg', description: 'Tecnologia híbrida avançada.', price: 'R$ 350' },
];

const productGrid = document.getElementById('productGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');

function renderProducts(list) {
productGrid.innerHTML = ''; // limpa grid
list.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'bg-white rounded-lg shadow-md overflow-hidden flex flex-col';
    card.innerHTML = `
        <img src="${prod.image}" alt="${prod.name}" class="h-48 w-full object-cover">
        <div class="p-4 flex-1 flex flex-col justify-between">
            <div>
                <h3 class="text-lg font-semibold text-gray-800 mb-2">${prod.name}</h3>
                <p class="text-sm text-gray-600 mb-4">${prod.description}</p>
            </div>
            <div class="flex items-center justify-between">
                <span class="font-bold text-green-600">${prod.price}</span>
                <button class="bg-green-500 hover:bg-green-600 text-white font-bold py-1 px-3 rounded-md">Detalhes</button>
            </div>
        </div>
    `;
    productGrid.appendChild(card);
});
}

function filterAndRender() {
const searchTerm = searchInput.value.toLowerCase();
const category = categoryFilter.value;
let filtered = products.filter(prod => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm);
    const matchesCategory = category === '' || prod.category === category;
    return matchesSearch && matchesCategory;
});
renderProducts(filtered);
}

// Eventos
searchInput.addEventListener('input', filterAndRender);
categoryFilter.addEventListener('change', filterAndRender);

// Render inicial
renderProducts(products);
