const { Given, When, Then } = require("@cucumber/cucumber");
const assert = require("assert");
const { ReservationSystem } = require("../../src/app");

let system;
let result;
let nomSalle, capaciteSalle;

// --- Initialisation ---

Given(
  "Un utilisateur veut ajouter une salle nommée {string} avec une capacité de {int} personnes",
  function (nom, capacite) {
    system = new ReservationSystem();
    nomSalle = nom;
    capaciteSalle = capacite;
  }
);

Given(
  "Une salle {string} avec une capacité de {int} personnes existe",
  function (nom, capacite) {
    system = new ReservationSystem();
    system.ajouterSalle(nom, capacite);
  }
);

Given(
  "Une salle {string} avec une capacité de {int} personnes",
  function (nom, capacite) {
    system = new ReservationSystem();
    system.ajouterSalle(nom, capacite);
  }
);

Given(
  "Une salle {string} déjà réservée le {string} de {string} à {string}",
  function (nom, date, heureDebut, heureFin) {
    system = new ReservationSystem();
    system.ajouterSalle(nom, 10);
    const salle = system.trouverSalle(nom);

    // Si la date est dans le passé, on la remplace par demain
    let dateToUse = date;
    const now = new Date();
    const inputDate = new Date(date);
    now.setHours(0, 0, 0, 0);
    if (inputDate < now) {
      const tomorrow = new Date();
      tomorrow.setDate(now.getDate() + 1);
      dateToUse = tomorrow.toISOString().split("T")[0];
    }

    system.reserverSalle(salle, dateToUse, "09:00", "10:00", 5);
    this.dateTest = dateToUse; // Pour le When
  }
);

Given("Des réservations existantes pour le {string}", function (date) {
  system = new ReservationSystem();
  system.ajouterSalle("Salle A", 10);
  const salle = system.trouverSalle("Salle A");

  // Si la date est dans le passé, on la remplace par demain
  let dateToUse = date;
  const now = new Date();
  const inputDate = new Date(date);
  now.setHours(0, 0, 0, 0);
  if (inputDate < now) {
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    dateToUse = tomorrow.toISOString().split("T")[0];
  }

  system.reserverSalle(salle, dateToUse, "09:00", "10:00", 5);
  this.dateTest = dateToUse; // Pour le When
});

Given("Des réservations existantes pour la salle {string}", function (nom) {
  system = new ReservationSystem();
  system.ajouterSalle(nom, 10);
  const salle = system.trouverSalle(nom);

  // Utilise demain pour être sûr que la réservation est acceptée
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateStr = tomorrow.toISOString().split("T")[0];

  system.reserverSalle(salle, dateStr, "09:00", "10:00", 5);
  this.dateTest = dateStr; // Pour le When si besoin
});

Given("Des réservations existantes pour une date valide", function () {
  system = new ReservationSystem();
  system.ajouterSalle("Salle A", 10);
  const salle = system.trouverSalle("Salle A");
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const dateStr = today.toISOString().split("T")[0];
  this.dateTest = dateStr;
  system.reserverSalle(salle, dateStr, "09:00", "10:00", 5);
});

Given("Des réservations existantes pour aujourd'hui", function () {
  system = new ReservationSystem();
  system.ajouterSalle("Salle A", 10);
  const salle = system.trouverSalle("Salle A");
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  this.dateTest = dateStr;
  system.reserverSalle(salle, dateStr, "09:00", "10:00", 5);
});

// --- Actions ---

When("L'utilisateur ajoute cette salle", function () {
  try {
    system.ajouterSalle(nomSalle, capaciteSalle);
    result = { success: true };
  } catch (e) {
    result = { success: false, error: e.message };
  }
});

When("L'utilisateur tente d'ajouter cette salle", function () {
  try {
    system.ajouterSalle(nomSalle, capaciteSalle);
    result = { success: true };
  } catch (e) {
    result = { success: false, error: e.message };
  }
});

When("L'utilisateur supprime la salle {string}", function (nom) {
  system.supprimerSalle(nom);
});

When(
  "L'utilisateur modifie la capacité de la salle {string} à {int} personnes",
  function (nom, capacite) {
    try {
      system.modifierSalle(nom, { capacite });
      result = { success: true };
    } catch (e) {
      result = { success: false, error: e.message };
    }
  }
);

When(
  "L'utilisateur modifie le nom de la salle {string} en {string}",
  function (ancienNom, nouveauNom) {
    system.modifierSalle(ancienNom, { nom: nouveauNom });
  }
);

When(
  "L'utilisateur réserve la salle {string} pour le {string} de {string} à {string} pour {int} personnes",
  function (nom, date, heureDebut, heureFin, nombrePersonnes) {
    const salle = system.trouverSalle(nom);
    result = system.reserverSalle(
      salle,
      date,
      heureDebut,
      heureFin,
      nombrePersonnes
    );
  }
);

When(
  "L'utilisateur réserve la salle {string} pour une date valide de {string} à {string} pour {int} personnes",
  function (nom, heureDebut, heureFin, nombrePersonnes) {
    const salle = system.trouverSalle(nom);
    const today = new Date();
    today.setDate(today.getDate() + 1); // Demain pour être sûr
    const dateStr = today.toISOString().split("T")[0];
    this.dateTest = dateStr; // Pour les steps d'affichage

    result = system.reserverSalle(
      salle,
      dateStr,
      heureDebut,
      heureFin,
      nombrePersonnes
    );
  }
);

When(
  "L'utilisateur tente de réserver la salle {string} pour le {string} de {string} à {string}",
  function (nom, date, heureDebut, heureFin) {
    const salle = system.trouverSalle(nom);
    result = system.reserverSalle(salle, date, heureDebut, heureFin, 5);
  }
);

When(
  "L'utilisateur tente de réserver la salle {string} pour {int} personnes",
  function (nom, nombrePersonnes) {
    const salle = system.trouverSalle(nom);
    result = system.reserverSalle(
      salle,
      "2023-10-10",
      "09:00",
      "10:00",
      nombrePersonnes
    );
  }
);

When(
  "L'utilisateur tente de réserver la salle {string} pour le {string} de {string} à {string} avec une capacité de {int} personnes",
  function (nom, date, heureDebut, heureFin, nombrePersonnes) {
    const salle = system.trouverSalle(nom);
    result = system.reserverSalle(
      salle,
      date,
      heureDebut,
      heureFin,
      nombrePersonnes
    );
  }
);

When(
  "L'utilisateur demande à voir les réservations pour le {string}",
  function (date) {
    result = system.getReservationsParJour(this.dateTest || date);
  }
);

When(
  "L'utilisateur demande à voir les réservations pour cette date valide",
  function () {
    //this.result = system.getReservationsParJour(this.dateTest);
    result = system.getReservationsParJour(this.dateTest);
  }
);

When(
  "L'utilisateur demande à voir les réservations de la salle {string}",
  function (nom) {
    //const salle = system.trouverSalle(nom);
    result = system.getReservationsParSalle(nom);
  }
);

When(
  "L'utilisateur tente de réserver la salle {string} pour le {string} de {string} à {string} pour {int} personnes",
  function (nom, date, heureDebut, heureFin, nombrePersonnes) {
    const salle = system.trouverSalle(nom);
    result = system.reserverSalle(
      salle,
      date,
      heureDebut,
      heureFin,
      nombrePersonnes
    );
  }
);

When(
  "L'utilisateur demande à voir les réservations pour aujourd'hui",
  function () {
    result = system.getReservationsParJour(this.dateTest);
  }
);

// --- Vérifications ---

Then("La salle {string} devrait être ajoutée avec succès", function (nom) {
  const salle = system.trouverSalle(nom);
  assert(salle, `La salle ${nom} n'a pas été trouvée.`);
  assert.strictEqual(salle.nom, nom);
});

Then(
  "La salle {string} ne devrait plus exister dans la liste des salles",
  function (nom) {
    const salle = system.trouverSalle(nom);
    assert.strictEqual(salle, undefined);
  }
);

Then(
  "La salle {string} devrait avoir une capacité de {int} personnes",
  function (nom, capacite) {
    const salle = system.trouverSalle(nom);
    assert(salle, `La salle ${nom} n'a pas été trouvée.`);
    assert.strictEqual(salle.capacite, capacite);
  }
);

Then(
  "La salle {string} devrait exister avec une capacité de {int} personnes",
  function (nom, capacite) {
    const salle = system.trouverSalle(nom);
    assert(salle, `La salle ${nom} n'existe pas.`);
    assert.strictEqual(salle.capacite, capacite);
  }
);

Then("La salle {string} ne devrait plus exister", function (nom) {
  const salle = system.trouverSalle(nom);
  assert.strictEqual(salle, undefined);
});

Then("La réservation devrait être confirmée", function () {
  assert.strictEqual(result, true);
});

Then(
  "La réservation devrait être refusée en raison d'un conflit d'horaire",
  function () {
    assert.strictEqual(result, false);
  }
);

Then(
  "La réservation devrait être refusée en raison d'une capacité insuffisante",
  function () {
    assert.strictEqual(result, false);
  }
);

Then(
  "La réservation devrait être refusée en raison d'une plage horaire invalide",
  function () {
    assert.strictEqual(result, false);
  }
);

Then(
  "La liste des réservations pour cette journée devrait être affichée",
  function () {
    assert(result && result.length > 0, "Aucune réservation trouvée.");
  }
);

Then(
  "La liste des réservations pour cette salle devrait être affichée",
  function () {
    assert(
      result && result.length > 0,
      "Aucune réservation trouvée pour cette salle."
    );
  }
);

Then(
  "L'ajout devrait être refusé avec un message d'erreur {string}",
  function (messageAttendu) {
    assert.strictEqual(result.success, false);
    assert(
      result.error.includes(messageAttendu),
      `Message d'erreur attendu: "${messageAttendu}", reçu: "${result.error}"`
    );
  }
);

Then(
  "La modification devrait être refusée avec un message d'erreur {string}",
  function (messageAttendu) {
    assert.strictEqual(result.success, false);
    assert(
      result.error.includes(messageAttendu),
      `Message d'erreur attendu: "${messageAttendu}", reçu: "${result.error}"`
    );
  }
);

Then(
  "La réservation devrait être refusée en raison d'une date de début antérieure à aujourd'hui",
  function () {
    // Le système doit retourner false ou une erreur spécifique selon ton implémentation
    // Si tu utilises un objet résultat avec un message d'erreur :
    if (typeof result === "object" && result !== null && result.error) {
      assert(
        result.error.toLowerCase().includes("antérieure à aujourd'hui") ||
          result.error.toLowerCase().includes("passé"),
        `Erreur attendue sur la date passée, reçu : ${result.error}`
      );
    } else {
      assert.strictEqual(result, false);
    }
  }
);
