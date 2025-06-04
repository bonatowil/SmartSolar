// ../assets/js/cadastro_placa.js

document.addEventListener('DOMContentLoaded', () => {

    const form = document.getElementById('form-cadastro-placa');
    // API_BASE_URL é necessário aqui novamente
    const API_BASE_URL = 'http://localhost:8080';

    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // 1. Coleta e formata todos os dados do formulário
        const placaData = {
            marca: document.getElementById('marca').value,
            modelo: document.getElementById('modelo').value,
            potencia: parseInt(document.getElementById('potencia').value, 10),
            preco: parseFloat(document.getElementById('preco').value),
            peso: parseFloat(document.getElementById('peso').value),
            dimensaoX: parseInt(document.getElementById('dimensaoX').value, 10),
            dimensaoY: parseInt(document.getElementById('dimensaoY').value, 10),
            dimensaoZ: parseInt(document.getElementById('dimensaoZ').value, 10),
            descricao: document.getElementById('descricao').value
        };

        // Verificação simples para campos vazios
        for (const key in placaData) {
            if (!placaData[key] && placaData[key] !== 0) { 
                alert(`O campo "${key}" é obrigatório.`);
                return;
            }
        }
        
        console.log('Dados prontos para enviar:', placaData);

        // 2. Lógica de Autenticação Basic (direto aqui)
        const email = localStorage.getItem('userEmail');
        const password = localStorage.getItem('userPassword');

        if (!email || !password) {
            alert('Você não está logado. Por favor, faça o login para continuar.');
            window.location.href = 'index.html'; 
            return;
        }

        try {
            // 3. Faz a chamada fetch com o cabeçalho de autenticação
            const response = await fetch(`${API_BASE_URL}/placa/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa('admin:admin'),
                },
                body: JSON.stringify(placaData)
            });

            // 4. Trata a resposta
            if (response.ok) { // Se o status for 200-299 (ex: 201 Created)
                alert('Placa cadastrada com sucesso!');
                // const placaCriada = await response.json(); // Se o backend retornar a placa criada
                // console.log('Placa criada:', placaCriada);
                window.location.href = 'placas.html';
            } else {
                if (response.status === 401) {
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userPassword');
                    localStorage.removeItem('usuarioId');
                    alert('Sua sessão expirou ou as credenciais são inválidas. Por favor, faça login novamente.');
                    window.location.href = 'index.html';
                    throw new Error('Não autorizado (401)');
                }
                // Tenta ler uma mensagem de erro do backend
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status} do servidor.` }));
                throw new Error(errorData.message || `Erro na API: ${response.status}`);
            }

        } catch (error) {
            console.error('Erro no cadastro:', error);
            // Não mostra o alerta se já foi redirecionado por 401
            if (error.message !== 'Não autorizado (401)') {
                alert(`Não foi possível cadastrar a placa: ${error.message}`);
            }
        }
    });
});