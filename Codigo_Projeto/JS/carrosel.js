document.addEventListener('DOMContentLoaded', () => {
    const carousels = document.querySelectorAll('.carousel-wrapper');

    carousels.forEach(wrapper => {
        const track = wrapper.querySelector('.cards');
        const nextButton = wrapper.querySelector('.next-button');
        const prevButton = wrapper.querySelector('.prev-button');
        const cards = Array.from(track.children);

        if (cards.length === 0) return; 
        
        let currentCardIndex = 0;
        
        const cardsPerPage = 3;

        const cardWidthWithGap = cards[0].offsetWidth + 30;

        const moveCards = () => {
            const offset = -currentCardIndex * cardWidthWithGap;
            track.style.transform = `translateX(${offset}px)`;
            prevButton.disabled = currentCardIndex === 0;
            nextButton.disabled = currentCardIndex >= cards.length - cardsPerPage;
        };

        nextButton.addEventListener('click', () => {
            if (currentCardIndex < cards.length - cardsPerPage) {
                currentCardIndex++;
                moveCards();
            }
        });

        prevButton.addEventListener('click', () => {
            if (currentCardIndex > 0) {
                currentCardIndex--;
                moveCards();
            }
        });

        moveCards();
    });
});