const track = document.getElementById("carousel-track");
const prevBtn = document.getElementById("prev-btn");
const nextBtn = document.getElementById("next-btn");
const itemWidth = track.children[0].offsetWidth + 16; // largura do item + margem
const totalItems = track.children.length;
const visibleItems = 4; // quantos aparecem por vez
let currentIndex = 0;

nextBtn.addEventListener("click", () => {
    currentIndex++;

    // Se passar do último item visível
    if (currentIndex > totalItems - visibleItems) {
        currentIndex = 0; // Volta pro início
    }

    const scrollAmount = itemWidth * currentIndex;
    track.style.transform = `translateX(-${scrollAmount}px)`;
});

prevBtn.addEventListener("click", () => {
    currentIndex--;

    // Se voltar antes do primeiro
    if (currentIndex < 0) {
        currentIndex = totalItems - visibleItems; // Vai para o fim
    }

    const scrollAmount = itemWidth * currentIndex;
    track.style.transform = `translateX(-${scrollAmount}px)`;
});
