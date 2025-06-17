const readline = require('readline');
const { Salle, ReservationSystem } = require('./app');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const systeme = new ReservationSystem();

function menuPrincipal() {
  console.log("\n=== MENU PRINCIPAL ===");
  console.log("1. Gestion des salles");
  console.log("2. Réservation de salle");
  console.log("3. Règles métier");
  console.log("4. Afficher les réservations");
  console.log("5. Quitter");
  rl.question("Ton choix ? ", handleMenuPrincipal);
}

function handleMenuPrincipal(choix) {
  switch (choix.trim()) {
    case '1':
      menuGestionSalles();
      break;
    case '2':
      menuReservation();
      break;
    case '3':
      afficherReglesMetier();
      break;
    case '4':
      menuAffichageReservations();
      break;
    case '5':
      console.log("À bientôt !");
      rl.close();
      break;
    default:
      console.log("Choix invalide.");
      menuPrincipal();
  }
}

/* --- Gestion des salles --- */

function menuGestionSalles() {
  console.log("\n=== GESTION DES SALLES ===");
  console.log("1. Ajouter une salle");
  console.log("2. Modifier une salle");
  console.log("3. Supprimer une salle");
  console.log("4. Retour au menu principal");
  rl.question("Ton choix ? ", handleGestionSalles);
}

function handleGestionSalles(choix) {
  switch (choix.trim()) {
    case '1':
      ajouterSalle();
      break;
    case '2':
      modifierSalle();
      break;
    case '3':
      supprimerSalle();
      break;
    case '4':
      menuPrincipal();
      break;
    default:
      console.log("Choix invalide.");
      menuGestionSalles();
  }
}

function ajouterSalle() {
  rl.question("Nom de la salle : ", (nom) => {
    rl.question("Capacité maximale : ", (capacite) => {
      try {
        systeme.ajouterSalle(nom, parseInt(capacite));
        console.log("Salle ajoutée !");
      } catch (e) {
        console.log("Erreur :", e.message);
      }
      menuGestionSalles();
    });
  });
}

function modifierSalle() {
  rl.question("Nom de la salle à modifier : ", (nom) => {
    const salle = systeme.trouverSalle(nom);
    if (!salle) {
      console.log("Salle introuvable.");
      return menuGestionSalles();
    }
    rl.question(`Nouveau nom (actuel: ${salle.nom}) : `, (nouveauNom) => {
      rl.question(`Nouvelle capacité (actuelle: ${salle.capacite}) : `, (nouvelleCap) => {
        try {
          systeme.modifierSalle(nom, { 
            nom: nouveauNom || salle.nom, 
            capacite: parseInt(nouvelleCap) || salle.capacite 
          });

          console.log("Salle modifiée !");
        } catch (e) {
          console.log("Erreur :", e.message);
        }
        menuGestionSalles();
      });
    });
  });
}

function supprimerSalle() {
  rl.question("Nom de la salle à supprimer : ", (nom) => {
    try {
      const ok = systeme.supprimerSalle(nom);
      if (ok) {
        console.log("Salle supprimée !");
      } else {
        console.log("Salle introuvable.");
      }
    } catch (e) {
      console.log("Erreur :", e.message);
    }
    menuGestionSalles();
  });
}

/* --- Réservation --- */

function menuReservation() {
  console.log("\n=== RÉSERVATION DE SALLE ===");
  rl.question("Nom de la salle à réserver : ", (nomSalle) => {
    const salle = systeme.trouverSalle(nomSalle);
    if (!salle) {
      console.log("Salle introuvable.");
      return menuPrincipal();
    }

    rl.question("Date début (YYYY-MM-DD) : ", (dateDebut) => {
      rl.question("Date fin (YYYY-MM-DD) : ", (dateFin) => {
        rl.question("Heure début (ex: 14) : ", (hDeb) => {
          rl.question("Heure fin (ex: 16) : ", (hFin) => {
            rl.question("Nombre de personnes : ", (nb) => {
              try {
                const ok = systeme.reserverSalle(
                  salle,
                  dateDebut,
                  dateFin,
                  parseInt(hDeb),
                  parseInt(hFin),
                  parseInt(nb)
                );
                if (ok) {
                  console.log("Réservation confirmée !");
                } else {
                  console.log("Erreur : conflit, capacité ou horaires invalides.");
                }
              } catch (e) {
                console.log("Erreur :", e.message);
              }
              menuPrincipal();
            });
          });
        });
      });
    });
  });
}

/* --- Règles métier --- */

function afficherReglesMetier() {
  console.log("\n=== RÈGLES MÉTIER ===");
  console.log("• Impossible de réserver une salle déjà occupée à cette plage horaire.");
  console.log("• Impossible de réserver une salle pour plus de personnes que sa capacité.");
  console.log("• Impossible de réserver une plage horaire invalide (heure de début après heure de fin).");
  menuPrincipal();
}

/* --- Affichage des réservations --- */

function menuAffichageReservations() {
  console.log("\n=== AFFICHAGE DES RÉSERVATIONS ===");
  console.log("1. Afficher les réservations d’un jour donné");
  console.log("2. Afficher les réservations d’une salle");
  console.log("3. Retour au menu principal");
  rl.question("Ton choix ? ", handleAffichageReservations);
}

function handleAffichageReservations(choix) {
  switch (choix.trim()) {
    case '1':
      rl.question("Date (YYYY-MM-DD) : ", (date) => {
        const res = systeme.getReservationsParJour(date);
        if (res.length === 0) {
          console.log("Aucune réservation.");
        } else {
          console.log(`📅 Réservations du ${date} :`);
          res.forEach(r =>
            console.log(`• ${r.salle.nom} de ${r.heureDebut}h à ${r.heureFin}h pour ${r.nombrePersonnes} pers.`)
          );
        }
        menuAffichageReservations();
      });
      break;
    case '2':
      rl.question("Nom de la salle : ", (nomSalle) => {
        const res = systeme.getReservationsParSalle(nomSalle);
        if (!res || res.length === 0) {
          console.log("Aucune réservation pour cette salle.");
        } else {
          console.log(`📅 Réservations pour la salle ${nomSalle} :`);
          res.forEach(r =>
            console.log(`• Le ${r.date} de ${r.heureDebut}h à ${r.heureFin}h pour ${r.nombrePersonnes} pers.`)
          );
        }
        menuAffichageReservations();
      });
      break;
    case '3':
      menuPrincipal();
      break;
    default:
      console.log("Choix invalide.");
      menuAffichageReservations();
  }
}

menuPrincipal();
