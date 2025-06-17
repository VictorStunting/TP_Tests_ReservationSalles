async function fetchAPI(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    const response = await fetch(`/api/${endpoint}`, options);
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
    }
    return method === 'DELETE' ? null : response.json();
}

// Remplacer les appels directs aux méthodes du système par des appels API
async function ajouterSalle() {
    const nom = document.getElementById('nomSalle').value;
    const capacite = parseInt(document.getElementById('capaciteSalle').value);
    try {
        await api.addSalle({ nom, capacite });
        await afficherListeSalles();
        await mettreAJourSelecteursSalles(); // Ajout de cette ligne
        document.getElementById('nomSalle').value = '';
        document.getElementById('capaciteSalle').value = '';
        afficherAlert('Salle ajoutée', 'success');
    } catch (error) {
        afficherAlert(error.message, 'error');
    }
}

// Modifier les autres fonctions de la même manière...