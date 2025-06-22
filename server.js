// Code server.js
// Ce fichier configure le serveur Express pour gérer les réservations de salles
const express = require("express");
const path = require("path");
const app = express();
const port = 3000;
const { ReservationSystem } = require("./src/app");

// Création d'une instance du système de réservation
const system = new ReservationSystem();

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, "src")));

// Initialisation des salles
let reservations = [];

// ---API Routes---
// Route pour servir le fichier HTML principal
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "src", "index.html"));
});

// Routes pour obtenir toutes les salles
app.get("/api/salles", (req, res) => {
  res.json(system.salles);
});

// Route pour ajouter une nouvelle salle
app.post("/api/salles", (req, res) => {
  try {
    const { nom, capacite } = req.body;
    system.ajouterSalle(nom, capacite);
    res.status(201).json({ message: "Salle ajoutée" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route pour supprimer une salle par son nom
app.delete("/api/salles/:nom", (req, res) => {
  try {
    const nomSalle = req.params.nom;

    // Trouver la salle avant de la supprimer
    const salle = system.trouverSalle(nomSalle);
    if (!salle) {
      return res.status(404).json({ error: "Salle non trouvée" });
    }

    // Supprimer les réservations liées à cette salle
    if (salle.reservations) {
      salle.reservations = [];
    }
    if (system.reservations) {
      //system.reservations = system.reservations.filter(r => r.salle.nom !== nomSalle);
      system.reservations = system.reservations.filter(
        (r) => r && r.nomSalle !== nomSalle
      );
    }

    // Supprimer la salle
    system.supprimerSalle(nomSalle);

    console.log(`Salle ${nomSalle} et ses réservations supprimées`);
    res.status(200).json({
      message: "Salle et réservations associées supprimées",
    });
  } catch (error) {
    console.error("Erreur suppression:", error);
    res.status(400).json({ error: error.message });
  }
});

// Route pour mettre à jour une salle par son nom
app.put("/api/salles/:nom", (req, res) => {
  try {
    const nomSalle = decodeURIComponent(req.params.nom);
    const { nom: nouveauNom, capacite } = req.body;

    // Valider les paramètres
    if (!nomSalle) {
      return res.status(400).json({ error: "Nom de salle requis" });
    }

    const salle = system.salles.find((s) => s.nom === nomSalle);
    if (!salle) {
      return res.status(404).json({ error: "Salle non trouvée" });
    }

    // Vérifier si le nouveau nom existe déjà (hors salle courante)
    if (
      nouveauNom &&
      nouveauNom !== nomSalle &&
      system.salles.some((s) => s.nom === nouveauNom)
    ) {
      return res.status(400).json({ error: "Ce nom de salle existe déjà" });
    }

    // Mise à jour des valeurs
    salle.nom = nouveauNom || salle.nom;
    salle.capacite = parseInt(capacite) || salle.capacite;

    res.json({
      message: "Salle modifiée",
      salle: {
        nom: salle.nom,
        capacite: salle.capacite,
      },
    });
  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(400).json({ error: error.message });
  }
});

// Route pour obtenir les réservations d'une salle spécifique
app.get("/api/reservations/salle/:nom", (req, res) => {
  try {
    const nomSalle = req.params.nom;
    console.log("Recherche des réservations pour:", nomSalle);
    console.log("Réservations en mémoire:", system.reservations);

    // Filtrer les réservations pour cette salle
    //const reservationsSalle = reservations.filter(r => r.nomSalle === nomSalle);
    const reservationsSalle = system.reservations.filter(
      (r) => r.nomSalle === nomSalle
    );
    console.log("Réservations trouvées:", reservationsSalle);

    res.json(reservationsSalle);
  } catch (error) {
    console.error("Erreur serveur:", error);
    res.status(400).json({ error: error.message });
  }
});

// Route pour ajouter une nouvelle réservation
app.post("/api/reservations", (req, res) => {
  try {
    const {
      nomSalle,
      dateDebut,
      heureDebut,
      dateFin,
      heureFin,
      nombrePersonnes,
    } = req.body;
    console.log("Nouvelle réservation - Données reçues:", req.body);

    // Vérification des champs obligatoires
    if (
      !nomSalle ||
      !dateDebut ||
      !heureDebut ||
      !dateFin ||
      !heureFin ||
      !nombrePersonnes
    ) {
      return res
        .status(400)
        .json({ error: "Tous les champs sont obligatoires" });
    }

    // Vérification de l'existence de la salle
    const salle = system.trouverSalle(nomSalle);
    if (!salle) {
      return res.status(404).json({ error: "Salle non trouvée" });
    }

    // Vérification de la capacité
    if (parseInt(nombrePersonnes) > salle.capacite) {
      return res.status(400).json({
        error: `Le nombre de personnes (${nombrePersonnes}) dépasse la capacité de la salle (${salle.capacite})`,
      });
    }

    // Vérification des conflits de réservation
    const debutDateTime = new Date(`${dateDebut}T${heureDebut}`);
    const finDateTime = new Date(`${dateFin}T${heureFin}`);

    if (finDateTime <= debutDateTime) {
      return res
        .status(400)
        .json({ error: "La date de fin doit être après la date de début" });
    }

    const heureDebutNum = parseInt(heureDebut.split(":")[0], 10);
    const heureFinNum = parseInt(heureFin.split(":")[0], 10);

    if (heureDebutNum < 8 || heureFinNum > 18) {
      return res.status(400).json({
        error: "Les réservations doivent être comprises entre 8h et 18h",
      });
    }

    const conflit = system.reservations.some((r) => {
      if (r.nomSalle !== nomSalle) return false;
      const rDebut = new Date(`${r.dateDebut}T${r.heureDebut}`);
      const rFin = new Date(`${r.dateFin}T${r.heureFin}`);
      return debutDateTime < rFin && finDateTime > rDebut;
    });

    if (conflit) {
      return res
        .status(400)
        .json({ error: "La salle est déjà réservée sur ce créneau" });
    }

    // Créer la réservation
    const reservation = {
      nomSalle,
      dateDebut,
      heureDebut,
      dateFin,
      heureFin,
      nombrePersonnes: parseInt(nombrePersonnes),
    };

    // Ajouter la réservation au système
    system.reservations.push(reservation);
    console.log("Réservation ajoutée:", reservation);
    res.status(201).json(reservation);
  } catch (error) {
    console.error("Erreur réservation:", error);
    res.status(400).json({ error: error.message });
  }
});

// Route pour obtenir toutes les réservations selon la date
app.get("/api/reservations/jour/:date", (req, res) => {
  try {
    const reservations = system.getReservationsParJour(req.params.date);
    res.json(reservations);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route pour obtenir les réservations d'une salle spécifique
app.get("/api/reservations/salle/:nom", (req, res) => {
  try {
    const nomSalle = req.params.nom;
    const reservationsSalle = system.reservations.filter(
      (r) => r.nomSalle === nomSalle
    );

    reservationsSalle.sort((a, b) => {
      const dateA = new Date(`${a.dateDebut}T${a.heureDebut}`);
      const dateB = new Date(`${b.dateDebut}T${b.heureDebut}`);
      return dateA - dateB;
    });

    res.json(reservationsSalle);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Route pour vérifier la disponibilité d'une salle
app.post("/api/reservations/check", (req, res) => {
  try {
    const { nomSalle, dateDebut, heureDebut, dateFin, heureFin } = req.body;

    const salle = system.trouverSalle(nomSalle);
    if (!salle) {
      return res.status(404).json({ error: "Salle non trouvée" });
    }

    const debutDateTime = new Date(`${dateDebut}T${heureDebut}`);
    const finDateTime = new Date(`${dateFin}T${heureFin}`);

    const disponible = !reservations.some((r) => {
      if (r.nomSalle !== nomSalle) return false;
      const rDebut = new Date(`${r.dateDebut}T${r.heureDebut}`);
      const rFin = new Date(`${r.dateFin}T${r.heureFin}`);
      return debutDateTime < rFin && finDateTime > rDebut;
    });

    res.json(disponible);
  } catch (error) {
    console.error("Erreur vérification disponibilité:", error);
    res.status(400).json({ error: error.message });
  }
});

// Message de démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur http://localhost:${port}`);
});
