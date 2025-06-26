const cakeContainer = document.getElementById('cakeContainer');

// Add click listener to blow out candles
cakeContainer.addEventListener('click', () => {
    if (!cakeContainer.classList.contains('blown-out')) {
        cakeContainer.classList.add('blown-out');
        document.body.classList.add('blown-out');

        // Fade out the separate instruction text
        document.querySelector('.instruction').style.opacity = '0';
    }
});
