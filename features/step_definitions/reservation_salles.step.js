const { Given, When, Then } = require('@cucumber/cucumber');
const assert = require('assert');
const { ReservationSystem } = require('../../src/app');

let system;
let result;

//
// --- Initialisation
//

Given('Un utilisateur veut ajouter une salle nommée {string} avec une capacité de {int} personnes', function (nom, capacite) {
  system = new ReservationSystem();
  system.ajouterSalle(nom, capacite);
});

Given('Une salle {string} avec une capacité de {int} personnes existe', function (nom, capacite) {
  system = new ReservationSystem();
  system.ajouterSalle(nom, capacite);
});

Given('Une salle {string} avec une capacité de {int} personnes', function (nom, capacite) {
  system = new ReservationSystem();
  system.ajouterSalle(nom, capacite);
});

Given('Une salle {string} déjà réservée le {string} de {string} à {string}', function (nom, date, heureDebut, heureFin) {
  system = new ReservationSystem();
  system.ajouterSalle(nom, 10);
  const salle = system.trouverSalle(nom);
  system.reserverSalle(salle, date, heureDebut, heureFin, 5);
});

Given('Des réservations existantes pour le {string}', function (date) {
  system = new ReservationSystem();
  system.ajouterSalle('Salle A', 10);
  const salle = system.trouverSalle('Salle A');
  system.reserverSalle(salle, date, '09:00', '10:00', 5);
});

Given('Des réservations existantes pour la salle {string}', function (nom) {
  system = new ReservationSystem();
  system.ajouterSalle(nom, 10);
  const salle = system.trouverSalle(nom);
  system.reserverSalle(salle, '2023-10-10', '09:00', '10:00', 5);
});

//
// --- Actions
//

When('L\'utilisateur ajoute cette salle', function () {
  // Ajout déjà effectué dans le Given
});

When('L\'utilisateur supprime la salle {string}', function (nom) {
  system.supprimerSalle(nom);
});

When('L\'utilisateur modifie la capacité de la salle {string} à {int} personnes', function (nom, capacite) {
  system.modifierSalle(nom, { capacite });
});

When('L\'utilisateur modifie le nom de la salle {string} en {string}', function (ancienNom, nouveauNom) {
  system.modifierSalle(ancienNom, { nom: nouveauNom });
});

When('L\'utilisateur réserve la salle {string} pour le {string} de {string} à {string} pour {int} personnes', function (nom, date, heureDebut, heureFin, nombrePersonnes) {
  const salle = system.trouverSalle(nom);
  result = system.reserverSalle(salle, date, heureDebut, heureFin, nombrePersonnes);
});

When('L\'utilisateur tente de réserver la salle {string} pour le {string} de {string} à {string}', function (nom, date, heureDebut, heureFin) {
  const salle = system.trouverSalle(nom);
  result = system.reserverSalle(salle, date, heureDebut, heureFin, 5);
});

When('L\'utilisateur tente de réserver la salle {string} pour {int} personnes', function (nom, nombrePersonnes) {
  const salle = system.trouverSalle(nom);
  result = system.reserverSalle(salle, '2023-10-10', '09:00', '10:00', nombrePersonnes);
});

When('L\'utilisateur tente de réserver la salle {string} pour le {string} de {string} à {string} avec une capacité de {int} personnes', function (nom, date, heureDebut, heureFin, nombrePersonnes) {
  const salle = system.trouverSalle(nom);
  result = system.reserverSalle(salle, date, heureDebut, heureFin, nombrePersonnes);
});

When('L\'utilisateur demande à voir les réservations pour le {string}', function (date) {
  result = system.getReservationsParJour(date);
});

When('L\'utilisateur demande à voir les réservations de la salle {string}', function (nom) {
  const salle = system.trouverSalle(nom);
  result = system.getReservationsParSalle(salle);
});

//
// --- Vérifications
//

Then('La salle {string} devrait être ajoutée avec succès', function (nom) {
  const salle = system.trouverSalle(nom);
  assert(salle, `La salle ${nom} n'a pas été trouvée.`);
  assert.strictEqual(salle.nom, nom);
});

Then('La salle {string} ne devrait plus exister dans la liste des salles', function (nom) {
  const salle = system.trouverSalle(nom);
  assert.strictEqual(salle, undefined);
});

Then('La salle {string} devrait avoir une capacité de {int} personnes', function (nom, capacite) {
  const salle = system.trouverSalle(nom);
  assert(salle, `La salle ${nom} n'a pas été trouvée.`);
  assert.strictEqual(salle.capacite, capacite);
});

Then('La salle {string} devrait exister avec une capacité de {int} personnes', function (nom, capacite) {
  const salle = system.trouverSalle(nom);
  assert(salle, `La salle ${nom} n'existe pas.`);
  assert.strictEqual(salle.capacite, capacite);
});

Then('La salle {string} ne devrait plus exister', function (nom) {
  const salle = system.trouverSalle(nom);
  assert.strictEqual(salle, undefined);
});

Then('La réservation devrait être confirmée', function () {
  assert.strictEqual(result, true);
});

Then('La réservation devrait être refusée en raison d\'un conflit d\'horaire', function () {
  assert.strictEqual(result, false);
});

Then('La réservation devrait être refusée en raison d\'une capacité insuffisante', function () {
  assert.strictEqual(result, false);
});

Then('La réservation devrait être refusée en raison d\'une plage horaire invalide', function () {
  assert.strictEqual(result, false);
});

Then('La liste des réservations pour cette journée devrait être affichée', function () {
  assert(result && result.length > 0, 'Aucune réservation trouvée.');
});

Then('La liste des réservations pour cette salle devrait être affichée', function () {
  assert(result && result.length > 0, 'Aucune réservation trouvée pour cette salle.');
});
