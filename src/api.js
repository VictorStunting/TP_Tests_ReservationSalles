async function callApi(endpoint, method = 'GET', body = null) {
    console.log(`Appel API: ${method} ${endpoint}`, body);

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`/api/${endpoint}`, options);
        console.log('Réponse reçue:', response.status);

        let data = null;
        const text = await response.text();
        
        // Vérifier si la réponse est du HTML (erreur)
        if (text.trim().startsWith('<!DOCTYPE')) {
            throw new Error('Le serveur a retourné une page HTML au lieu de JSON');
        }

        if (text.trim()) {
            try {
                data = JSON.parse(text);
            } catch (parseError) {
                console.error('Erreur de parsing JSON:', parseError);
                console.error('Réponse brute reçue:', text);
                throw new Error('Format de réponse invalide');
            }
        }

        if (!response.ok) {
            throw new Error(data?.error || `Erreur ${response.status}: ${response.statusText}`);
        }
        
        return data;
    } catch (error) {
        console.error('Erreur détaillée:', {
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
}



const api = {
    getSalles: () => callApi('salles'),
    addSalle: (salle) => callApi('salles', 'POST', salle),
    updateSalle: async (nom, salle) => {
        try {
            // Valider les paramètres
            if (!nom) throw new Error('Nom de salle requis');
            if (!salle?.capacite) throw new Error('Capacité requise');

            const response = await callApi(
                `salles/${encodeURIComponent(nom)}`, 
                'PUT', 
                {
                    nom: salle.nom || nom,
                    capacite: parseInt(salle.capacite)
                }
            );
            return response;
        } catch (error) {
            console.error('Erreur dans updateSalle:', {
                nom,
                salle,
                error: error.message
            });
            throw error;
        }
    },
    deleteSalle: (nom) => callApi(`salles/${nom}`, 'DELETE'),
    getReservationsJour: (date) => callApi(`reservations/jour/${date}`),
    getReservationsSalle: (nom) => callApi(`reservations/salle/${nom}`),
    /*
    addReservation: async (reservation) => {
        const dateTimeDebut = `${reservation.dateDebut}T${reservation.heureDebut}`;
        const dateTimeFin = `${reservation.dateFin}T${reservation.heureFin}`;
        
        return callApi('reservations', 'POST', {
            nomSalle: reservation.nomSalle,
            dateDebut: dateTimeDebut,
            dateFin: dateTimeFin,
            nombrePersonnes: parseInt(reservation.nombrePersonnes)
        });
    },
    */
   addReservation: async (reservation) => {
        // Vérification des données requises
        if (!reservation.dateDebut || !reservation.heureDebut || !reservation.dateFin || !reservation.heureFin) {
            throw new Error('Dates et heures requises');
        }

        // Formatage des dates
        //const dateTimeDebut = `${reservation.dateDebut}T${reservation.heureDebut || '00:00'}`;
        //const dateTimeFin = `${reservation.dateFin}T${reservation.heureFin || '00:00'}`;
        
        console.log('Envoi réservation:', {
            nomSalle: reservation.nomSalle,
            dateDebut: reservation.dateDebut,
            dateFin: reservation.dateFin,
            heureDebut: reservation.heureDebut,
            heureFin: reservation.heureFin,
            nombrePersonnes: reservation.nombrePersonnes
        });

        return callApi('reservations', 'POST', {
            nomSalle: reservation.nomSalle,
            dateDebut: reservation.dateDebut,
            dateFin: reservation.dateFin,
            heureDebut: reservation.heureDebut,
            heureFin: reservation.heureFin,
            nombrePersonnes: parseInt(reservation.nombrePersonnes)
        });
    },
   
   /* 
    checkDisponibilite: async (params) => {
        const dateTimeDebut = `${params.dateDebut}T${params.heureDebut}`;
        const dateTimeFin = `${params.dateFin}T${params.heureFin}`;
        
        const response = await callApi('reservations/check', 'POST', {
            nomSalle: params.nomSalle,
            dateDebut: dateTimeDebut,
            dateFin: dateTimeFin,
        });
        return response;
    }
        */
    checkDisponibilite: async (params) => {
        // Vérification des paramètres
        if (!params.dateDebut || !params.heureDebut || !params.dateFin || !params.heureFin) {
            throw new Error('Dates et heures requises pour la vérification');
        }

        const dateTimeDebut = `${params.dateDebut}T${params.heureDebut || '00:00'}`;
        const dateTimeFin = `${params.dateFin}T${params.heureFin || '00:00'}`;
        
        console.log('Vérification disponibilité:', {
            nomSalle: params.nomSalle,
            dateDebut: dateTimeDebut,
            dateFin: dateTimeFin
        });

        return callApi('reservations/check', 'POST', {
            nomSalle: params.nomSalle,
            dateDebut: dateTimeDebut,
            dateFin: dateTimeFin
        });
    }
};