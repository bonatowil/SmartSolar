// Em ../assets/js/utils.js (ou no início do map.js se não usar utils.js)

/**
 * Exibe uma notificação toast usando Toastify JS.
 * @param {string} message A mensagem a ser exibida.
 * @param {string} [type='info'] O tipo de toast ('info', 'success', 'warning', 'error').
 * @param {number} [duration=3000] A duração em milissegundos que o toast ficará visível.
 */
function showAppToast(message, type = 'info', duration = 3000) {
    if (typeof Toastify === 'undefined') {
        console.error('Toastify JS não está carregado!');
        // Fallback para alert se Toastify não estiver disponível
        alert(`(${type.toUpperCase()}) ${message}`);
        return;
    }

    let backgroundColorStart, backgroundColorEnd;
    let className = `custom-toast-${type}`; // Para classes CSS personalizadas se necessário

    switch (type.toLowerCase()) {
        case 'success':
            // Gradientes de exemplo, você pode usar cores sólidas ou o que preferir
            backgroundColorStart = '#28a745'; // Verde Bootstrap success
            backgroundColorEnd = '#1e7e34';
            break;
        case 'error':
            backgroundColorStart = '#dc3545'; // Vermelho Bootstrap danger
            backgroundColorEnd = '#b02a37';
            break;
        case 'warning':
            backgroundColorStart = '#ffc107'; // Amarelo Bootstrap warning
            backgroundColorEnd = '#d39e00';
            break;
        case 'info':
        default:
            backgroundColorStart = '#17a2b8'; // Azul Bootstrap info
            backgroundColorEnd = '#117a8b';
            break;
    }

    Toastify({
        text: message,
        duration: duration,
        newWindow: true, 
        close: true, 
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
            border: "1px solid rgba(255, 255, 255, 0.1)",
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            background: `linear-gradient(to right, ${backgroundColorStart}, ${backgroundColorEnd})`,
            borderRadius: "10px",
            boxShadow: "0 3px 6px -1px rgba(0, 0, 0, 0.12), 0 10px 36px -4px rgba(77, 96, 232, 0.3)",
            fontWeight: "500"
        },
        onClick: function() {
        }
    }).showToast();
}