document.addEventListener('DOMContentLoaded', () => {

    const loginForm = document.getElementById('login-form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o recarregamento da página

        const email = emailInput.value;
        const password = passwordInput.value;

        if (!email || !password) {
            alert('Por favor, preencha o e-mail e a senha.');
            return;
        }

        const API_BASE_URL = 'http://localhost:8080';

        try {
            const response = await fetch(`${API_BASE_URL}/usuario/auth`, {
                method: 'GET',
                headers: {
                    'email': email,
                    'senha': password,
                    
                    'Authorization': 'Basic ' + btoa('admin:admin'),
                    'Content-Type': 'application/json'
                }
            });

            // Trata as respostas de erro da API
            if (response.ok) { // Status 200 OK
                const responseData = await response.json(); // Deverá ser {"usuarioId": X}

                // PONTO CRÍTICO CORRIGIDO:
                // Como não há token, salvamos o email e senha originais para o Basic Auth
                // nas próximas requisições (via apiService.js)
                // ALERTA: Salvar senhas em texto puro no localStorage não é seguro em produção!
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userPassword', password);
                
                // Salvamos também o usuarioId retornado pela API, se ele existir
                if (responseData && typeof responseData.usuarioId !== 'undefined') {
                    localStorage.setItem('usuarioId', responseData.usuarioId);
                    console.log('ID do usuário salvo:', responseData.usuarioId);
                } else {
                    console.warn('API de login não retornou um usuarioId esperado.');
                }
                
                alert('Login realizado com sucesso!');
                window.location.href = 'home.html';

            } else {
                // Se o status for 401 (Senha incorreta) ou 404 (Email não cadastrado)
                if (response.status === 401 || response.status === 404) {
                     alert('E-mail ou senha incorretos. Por favor, tente novamente.');
                } else {
                    // Outros erros do servidor
                    const errorText = await response.text(); // Tenta ler como texto se não for JSON
                    alert(`Erro no login: ${response.status} - ${errorText || 'Tente novamente.'}`);
                }
            }

        } catch (error) {
            // Trata erros de conexão (servidor offline, CORS, etc.)
            console.error('Falha na comunicação com a API:', error);
            alert('Não foi possível se conectar ao servidor. Verifique sua conexão.');
        }
    });
});