const express = require('express');
const path = require('path');
const app = express();
const port = 3000;
const { ReservationSystem } = require('./src/app');

const system = new ReservationSystem();

app.use(express.json());
app.use(express.static('src'));

// API Routes
app.get('/api/salles', (req, res) => {
    res.json(system.salles);
});

app.post('/api/salles', (req, res) => {
    try {
        const { nom, capacite } = req.body;
        system.ajouterSalle(nom, capacite);
        res.status(201).json({ message: 'Salle ajoutée' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});


app.delete('/api/salles/:nom', (req, res) => {
    try {
        const nomSalle = req.params.nom;
        
        // Trouver la salle avant de la supprimer
        const salle = system.trouverSalle(nomSalle);
        if (!salle) {
            return res.status(404).json({ error: 'Salle non trouvée' });
        }

        // Supprimer les réservations liées à cette salle
        if (salle.reservations) {
            salle.reservations = [];
        }
        if (system.reservations) {
            system.reservations = system.reservations.filter(r => r.salle.nom !== nomSalle);
        }

        // Supprimer la salle
        system.supprimerSalle(nomSalle);
        
        console.log(`Salle ${nomSalle} et ses réservations supprimées`);
        res.status(200).json({ 
            message: 'Salle et réservations associées supprimées' 
        });
    } catch (error) {
        console.error('Erreur suppression:', error);
        res.status(400).json({ error: error.message });
    }
});



app.put('/api/salles/:nom', (req, res) => {
    try {
        const nomSalle = decodeURIComponent(req.params.nom);
        const { nom: nouveauNom, capacite } = req.body;

        console.log('PUT /api/salles/:nom', {
            nomSalle,
            nouveauNom,
            capacite,
            body: req.body
        });

        // Valider les paramètres
        if (!nomSalle) {
            return res.status(400).json({ error: 'Nom de salle requis' });
        }

        const salle = system.salles.find(s => s.nom === nomSalle);
        if (!salle) {
            return res.status(404).json({ error: 'Salle non trouvée' });
        }

        // Mise à jour des valeurs
        salle.nom = nouveauNom || salle.nom;
        salle.capacite = parseInt(capacite) || salle.capacite;

        res.json({ 
            message: 'Salle modifiée',
            salle: {
                nom: salle.nom,
                capacite: salle.capacite
            }
        });
    } catch (error) {
        console.error('Erreur serveur:', error);
        res.status(400).json({ error: error.message });
    }
});


app.get('/api/reservations/salle/:nom', (req, res) => {
    try {
        const salle = system.trouverSalle(req.params.nom);
        if (!salle) {
            return res.status(404).json({ error: "Salle non trouvée" });
        }
        
        // Initialiser les réservations de la salle si nécessaire
        if (!salle.reservations) {
            salle.reservations = [];
        }
        
        console.log('Réservations trouvées pour', req.params.nom, ':', salle.reservations);
        res.json(salle.reservations || []);
    } catch (error) {
        console.error('Erreur serveur:', error);
        res.status(400).json({ error: error.message });
    }
});



app.post('/api/reservations', (req, res) => {
    try {
        const { nomSalle, dateDebut, dateFin, nombrePersonnes } = req.body;
        console.log('Données reçues:', req.body);

        const salle = system.trouverSalle(nomSalle);
        if (!salle) {
            return res.status(404).json({ error: "Salle non trouvée" });
        }

        // Création des dates
        const debutDateTime = new Date(dateDebut);
        const finDateTime = new Date(dateFin);

        // Vérification de la capacité
        if (parseInt(nombrePersonnes) > salle.capacite) {
            return res.status(400).json({ 
                error: `Le nombre de personnes (${nombrePersonnes}) dépasse la capacité de la salle (${salle.capacite})`
            });
        }

        // Vérifications de la date
        if (isNaN(debutDateTime.getTime()) || isNaN(finDateTime.getTime())) {
            return res.status(400).json({ error: "Dates invalides" });
        }
        if (finDateTime <= debutDateTime) {
            return res.status(400).json({ error: "La date de fin doit être après la date de début" });
        }

        // Vérifier l'heure (entre 8h et 18h)
        const heureDebut = debutDateTime.getHours();
        const heureFin = finDateTime.getHours();
        if (heureDebut < 8 || heureDebut > 18 || heureFin < 8 || heureFin > 18) {
            return res.status(400).json({ error: "Les réservations doivent être entre 8h et 18h" });
        }

        if (!salle.reservations) {
            salle.reservations = [];
        }

        // Vérifier le chevauchement
        const chevauchement = salle.reservations.some(r => {
            const rDebut = new Date(r.dateDebut);
            const rFin = new Date(r.dateFin);
            return (debutDateTime < rFin && finDateTime > rDebut);
        });

        if (chevauchement) {
            return res.status(400).json({ error: "La salle est déjà réservée sur ce créneau" });
        }

        // Ajouter la réservation
        salle.reservations.push({
            dateDebut: debutDateTime,
            dateFin: finDateTime,
            nombrePersonnes: parseInt(nombrePersonnes)
        });
        
        res.status(201).json({ message: 'Réservation créée' });
    } catch (error) {
        console.error('Erreur:', error);
        res.status(400).json({ error: error.message });
    }
});

app.get('/api/reservations/jour/:date', (req, res) => {
    try {
        const reservations = system.getReservationsParJour(req.params.date);
        res.json(reservations);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

// Modifier la route GET des réservations par salle
app.get('/api/reservations/salle/:nom', (req, res) => {
    try {
        const salle = system.trouverSalle(req.params.nom);
        if (!salle) {
            return res.status(404).json({ error: "Salle non trouvée" });
        }
        
        // Initialiser les réservations si elles n'existent pas
        if (!system.reservations) {
            system.reservations = [];
        }
        
        // Récupérer les réservations pour cette salle
        const reservations = system.getReservationsParSalle(req.params.nom);
        
        res.json(reservations || []);
    } catch (error) {
        console.error('Erreur serveur:', error);
        res.status(400).json({ error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
});

app.post('/api/reservations/check', (req, res) => {
    try {
        const { nomSalle, dateDebut, dateFin } = req.body;
        const salle = system.trouverSalle(nomSalle);
        
        if (!salle) {
            return res.status(404).json({ error: "Salle non trouvée" });
        }

        // Initialize reservations array if it doesn't exist
        salle.reservations = salle.reservations || [];

        const disponible = !salle.reservations.some(r => {
            const rDebut = new Date(r.dateDebut);
            const rFin = new Date(r.dateFin);
            const debut = new Date(dateDebut);
            const fin = new Date(dateFin);
            return (debut < rFin && fin > rDebut);
        });

        res.json(disponible); // Just send the boolean directly
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});