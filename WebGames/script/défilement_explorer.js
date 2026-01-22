document.querySelector('.liste').addEventListener('wheel', function(event) {
    if (event.deltaY !== 0) {
        // Empêche le défilement vertical par défaut
        event.preventDefault();
        // Défilement horizontal
        this.scrollLeft += event.deltaY; 
    }
});

    document.querySelector('.liste1').addEventListener('wheel', function(event) {
        if (event.deltaY !== 0) {
            // Empêche le défilement vertical par défaut
            event.preventDefault();
            // Défilement horizontal
            this.scrollLeft += event.deltaY; 
        }
});

document.querySelector('.liste2').addEventListener('wheel', function(event) {
    if (event.deltaY !== 0) {
        // Empêche le défilement vertical par défaut
        event.preventDefault();
        // Défilement horizontal
        this.scrollLeft += event.deltaY; 
    }
});