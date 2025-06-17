let systeme = null;

async function initialiserApp() {
    try {
        const salles = await api.getSalles();
        systeme = new ReservationSystem();
        salles.forEach(salle => {
            systeme.ajouterSalle(salle.nom, salle.capacite);
        });
        
        // Initialiser les sélecteurs d'heures
        ['heureDebut', 'heureFin'].forEach(selectId => {
            const select = document.getElementById(selectId);
            for (let i = 8; i <= 18; i++) {
                const option = document.createElement('option');
                option.value = i;
                option.textContent = `${i}h00`;
                select.appendChild(option);
            }
        });

        // Date par défaut = aujourd'hui
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('dateReservation').value = today;
        document.getElementById('datePlanning').value = today;

        mettreAJourStats();
        afficherListeSalles();
        mettreAJourSelecteursSalles();
    } catch (error) {
        afficherAlert(error.message, 'error');
    }
}

// Initialiser l'application au chargement
document.addEventListener('DOMContentLoaded', initialiserApp);