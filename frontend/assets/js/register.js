document.addEventListener('DOMContentLoaded', () => {

    const registerForm = document.getElementById('register-form');
    const fullnameInput = document.getElementById('fullname');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    registerForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        // 1. Validação no Frontend
        const password = passwordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        if (password !== confirmPassword) {
            showAppToast('As senhas não coincidem. Por favor, tente novamente.', 'error');
            return;
        }
        
        const userData = {
            nome: fullnameInput.value,
            email: emailInput.value,
            senha: password
        };

        const API_BASE_URL = 'http://localhost:8080';

        try {
            const response = await fetch(`${API_BASE_URL}/usuario/`, {
                method: 'POST',
                headers: {
                    'Authorization': 'Basic ' + btoa('admin:admin'),
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });

            if (response.status === 201) {
                showAppToast('Cadastro realizado com sucesso! Você será redirecionado para a página de login.', 'sucess');
                window.location.href = 'index.html'; 
            } else {
                const errorData = await response.json();
                if (response.status === 409) {
                    showAppToast(`Erro no cadastro: ${errorData.message || 'Este e-mail já está cadastrado.'}`, 'error');
                } else {
                    showAppToast(`Erro no cadastro: ${errorData.message || 'Verifique os dados informados.'}`, 'error');
                }
            }

        } catch (error) {
            console.error('Falha na comunicação com a API:', error);
            showAppToast('Não foi possível se conectar ao servidor. Verifique sua conexão ou contate o suporte.', 'error');
        }
    });
});