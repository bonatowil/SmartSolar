// ../assets/js/cadastro_placa.js

// Envolve todo o código para garantir que o DOM esteja carregado antes de qualquer manipulação.
document.addEventListener('DOMContentLoaded', () => {

    // Todas as referências a elementos do DOM agora estão seguras aqui dentro.
    const API_BASE_URL = 'http://localhost:8080';
    const form = document.getElementById('form-cadastro-placa');
    const modalEl = document.getElementById('cadastro-placa-modal');
    const modalTitle = document.getElementById('modal-title');
    const hiddenPlacaId = document.getElementById('edit-placa-id');
    const cadastrarBtn = document.querySelector('button[data-modal-toggle="cadastro-placa-modal"]');
    
    // A inicialização do Flowbite também deve estar aqui dentro.
    const flowbiteModal = new Modal(modalEl);

    /**
     * Abre o modal em modo de EDIÇÃO, preenchendo o formulário com dados existentes.
     * @param {object} placa - O objeto completo da placa a ser editada.
     */
    function openModalForEdit(placa) {
        form.reset();
        modalTitle.textContent = 'Editar Placa Solar';
        
        // Preenche o formulário
        document.getElementById('marca').value = placa.marca;
        document.getElementById('modelo').value = placa.modelo;
        document.getElementById('potencia').value = placa.potencia;
        document.getElementById('preco').value = placa.preco;
        document.getElementById('eficiencia').value = (placa.eficiencia * 100).toFixed(2);
        document.getElementById('dimensaoX').value = placa.dimensaoX;
        document.getElementById('dimensaoY').value = placa.dimensaoY;
        document.getElementById('dimensaoZ').value = placa.dimensaoZ;
        document.getElementById('descricao').value = placa.descricao;
        
        // Armazena o ID no campo oculto
        hiddenPlacaId.value = placa.placaId;
        
        flowbiteModal.show();
    }
    
    // CORREÇÃO: Expõe a função 'openModalForEdit' para o escopo global (window).
    // Isso permite que o script 'placas.js' a chame.
    window.openModalForEdit = openModalForEdit;


    /**
     * Abre o modal em modo de CRIAÇÃO, com o formulário limpo.
     */
    function openModalForCreate() {
        form.reset();
        modalTitle.textContent = 'Cadastrar Nova Placa Solar';
        hiddenPlacaId.value = ''; // Garante que o ID de edição esteja limpo
        // Não precisamos chamar flowbiteModal.show() aqui porque o próprio botão já faz isso via atributos data-*.
    }

    // Listener para o botão principal "Cadastrar Placa"
    cadastrarBtn.addEventListener('click', openModalForCreate);


    // Listener principal do formulário para CRIAR ou ATUALIZAR
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Coleta os dados do formulário
        const placaData = {
            marca: document.getElementById('marca').value,
            modelo: document.getElementById('modelo').value,
            potencia: parseInt(document.getElementById('potencia').value, 10),
            preco: parseFloat(document.getElementById('preco').value),
            eficiencia: parseFloat(document.getElementById('eficiencia').value) / 100,
            dimensaoX: parseInt(document.getElementById('dimensaoX').value, 10),
            dimensaoY: parseInt(document.getElementById('dimensaoY').value, 10),
            dimensaoZ: parseInt(document.getElementById('dimensaoZ').value, 10),
            descricao: document.getElementById('descricao').value
        };

        // Validação de campos
        for (const key in placaData) {
            if (placaData[key] == null || (typeof placaData[key] === 'number' && isNaN(placaData[key]))) {
                let nomeCampo = key;
                if(key.startsWith('dimensao')) nomeCampo = `Dimensão ${key.charAt(key.length - 1).toUpperCase()}`;
                if(key === 'eficiencia') nomeCampo = 'Eficiência';
                showAppToast(`O campo "${nomeCampo}" é obrigatório e deve ser válido.`, 'warning');
                return;
            }
        }

        const editId = hiddenPlacaId.value;
        const isEditing = editId !== '';
        
        const url = isEditing ? `${API_BASE_URL}/placa/${editId}` : `${API_BASE_URL}/placa/`;
        const method = isEditing ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('admin:admin'),
                },
                body: JSON.stringify(placaData)
            });

            if (response.ok) {
                const successMessage = isEditing ? 'Placa atualizada com sucesso!' : 'Placa cadastrada com sucesso!';
                showAppToast(successMessage, 'success');
                flowbiteModal.hide();
                setTimeout(() => window.location.reload(), 1500);
            } else {
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status} do servidor.` }));
                throw new Error(errorData.message || `Falha na operação: ${response.status}`);
            }

        } catch (error) {
            console.error('Erro no formulário:', error);
            showAppToast(`Não foi possível salvar: ${error.message}`, 'error');
        }
    });

});