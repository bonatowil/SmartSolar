const usuarioId = localStorage.getItem('usuarioId');
if (!usuarioId) {
    window.location.href = 'index.html';
}