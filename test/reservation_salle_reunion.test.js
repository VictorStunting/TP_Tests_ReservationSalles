const { ReservationSystem } = require("../src/app");

describe("ReservationSystem - gestion des salles et réservations", () => {
  let system;
  let salle;

  beforeEach(() => {
    system = new ReservationSystem();
  });

  //Ajout de salle
  test("ajouter une salle crée bien la salle avec son nom et sa capacité", () => {
    const salle = system.ajouterSalle("Salle A", 20);
    expect(salle.nom).toBe("Salle A");
    expect(salle.capacite).toBe(20);
  });

  //Suppression d'une salle
  test("supprimer une salle existante", () => {
    system.ajouterSalle("Salle A", 10);
    let salle = system.trouverSalle("Salle A");
    expect(salle).toBeDefined();

    system.supprimerSalle("Salle A");
    salle = system.trouverSalle("Salle A");
    expect(salle).toBeUndefined();
  });

  //Suppression d'une salle non existante
  test("supprimer une salle non existante", () => {
    system.ajouterSalle("Salle A", 10);
    let salle = system.trouverSalle("Salle A");
    expect(salle).toBeDefined();

    system.supprimerSalle("Salle C");
    salle = system.trouverSalle("Salle C");
    expect(salle).toBeUndefined();
  });

  //Modification de salle
  test("modifier le nom d'une salle existante", () => {
    system.ajouterSalle("Salle A", 10);
    system.modifierSalle("Salle A", { nom: "Salle B" });
    const ancienneSalle = system.trouverSalle("Salle A");
    const nouvelleSalle = system.trouverSalle("Salle B");
    expect(ancienneSalle).toBeUndefined();
    expect(nouvelleSalle).toBeDefined();
    expect(nouvelleSalle.capacite).toBe(10);
  });

  test("refuse de renommer une salle avec un nom déjà existant", () => {
    system.ajouterSalle("Salle A", 10);
    system.ajouterSalle("Salle B", 15);
    // Essaye de renommer "Salle A" en "Salle B"
    const result = system.modifierSalle("Salle A", { nom: "Salle B" });
    expect(result).toBe(false);
    // Vérifie que les deux salles existent toujours avec leur nom d'origine
    expect(system.trouverSalle("Salle A")).toBeDefined();
    expect(system.trouverSalle("Salle B")).toBeDefined();
  });

  //Modification de salle avec un nom vide
  test("modifier la capacité d'une salle existante", () => {
    system.ajouterSalle("Salle A", 10);
    system.modifierSalle("Salle A", { capacite: 15 });
    const salle = system.trouverSalle("Salle A");
    expect(salle.capacite).toBe(15);
  });

  //Réservation de salle
  //Réservation de salle avec une capacité suffisante
  test("réserver une salle avec une capacité suffisante réussit", () => {
    system.ajouterSalle("Salle A", 20);
    const salle = system.trouverSalle("Salle A");
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateStr = futureDate.toISOString().split("T")[0];
    const result = system.reserverSalle(salle, dateStr, "09:00", "10:00", 15);
    expect(result).toBe(true);
  });

  //Réservation de salle avec une capacité insuffisante
  test("réserver une salle avec une capacité insuffisante échoue", () => {
    system.ajouterSalle("Salle A", 10);
    const salle = system.trouverSalle("Salle A");
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateStr = futureDate.toISOString().split("T")[0];
    const result = system.reserverSalle(salle, dateStr, "09:00", "10:00", 15);
    expect(result).toBe(false); // <-- false attendu
  });

  //Réservation de salle avec un conflit d'horaire
  test("réserver une salle avec un conflit d'horaire échoue", () => {
    system.ajouterSalle("Salle A", 10);
    const salle = system.trouverSalle("Salle A");
    system.reserverSalle(salle, "2025-06-20", "09:00", "10:00", 5);
    const result = system.reserverSalle(
      salle,
      "2025-06-20",
      "09:30",
      "10:30",
      5
    );
    expect(result).toBe(false);
  });

  //Réservation de salle avec une plage horaire invalide
  test("réserver une salle avec une plage horaire invalide échoue", () => {
    system.ajouterSalle("Salle A", 10);
    const salle = system.trouverSalle("Salle A");
    const result = system.reserverSalle(
      salle,
      "2025-06-20",
      "10:00",
      "09:00",
      5
    );
    expect(result).toBe(false);
  });

  //Consultation de salle
  test("obtenir les réservations pour un jour donné renvoie la bonne liste", () => {
    system.ajouterSalle("Salle A", 10);
    const salle = system.trouverSalle("Salle A");

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateStr = futureDate.toISOString().split("T")[0];

    system.reserverSalle(salle, dateStr, "09:00", "10:00", 5);
    const reservations = system.getReservationsParJour(dateStr);
    expect(reservations.length).toBe(1);
    expect(reservations[0].salle.nom).toBe("Salle A");
  });

  //Consultation de salle avec une date
  test("obtenir les réservations d'une salle spécifique", () => {
    system.ajouterSalle("Salle A", 10);
    const salleA = system.trouverSalle("Salle A");

    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 1);
    const dateStr = futureDate.toISOString().split("T")[0];

    system.reserverSalle(salleA, dateStr, "09:00", "10:00", 5);

    const reservationsSalleA = system.getReservationsParSalle("Salle A");
    expect(reservationsSalleA.length).toBe(1);
    expect(reservationsSalleA[0].salle.nom).toBe("Salle A");
  });
});

// Tests avancés pour la validation des dates et heures de réservation
describe("ReservationSystem - Validations avancées des dates et heures", () => {
  let system;
  let salle;

  beforeEach(() => {
    system = new ReservationSystem();
    system.ajouterSalle("SalleTest", 10);
    salle = system.trouverSalle("SalleTest");
  });

  // Tests de validation des réservations
  // Ne devrait pas accepter une réservation dans le passé
  test("ne devrait pas accepter une réservation dans le passé", () => {
    system.ajouterSalle("Salle A", 10);
    const salle = system.trouverSalle("Salle A");
    const datePassee = new Date();
    datePassee.setDate(datePassee.getDate() - 1);
    const result = system.reserverSalle(
      salle,
      datePassee.toISOString().split("T")[0],
      "10:00",
      "11:00",
      5
    );
    expect(result).toBe(false);
  });

  // Ne devrait pas accepter une réservation avant 8h et après 18h
  test("ne devrait pas accepter une réservation avant 8h", () => {
    const result = system.reserverSalle(
      salle,
      "2025-12-01",
      "07:00",
      "09:00",
      5
    );
    expect(result).toBe(false);
  });

  // Ne devrait pas accepter une réservation après 18h
  test("ne devrait pas accepter une réservation après 18h", () => {
    const result = system.reserverSalle(
      salle,
      "2025-12-01",
      "17:00",
      "19:00",
      5
    );
    expect(result).toBe(false);
  });

  // Ne devrait pas accepter une réservation avec des horaires non valides
  test("devrait accepter une réservation valide dans les horaires normaux", () => {
    const result = system.reserverSalle(
      salle,
      "2025-12-01",
      "09:00",
      "11:00",
      5
    );
    expect(result).toBe(true);
  });

  // Ne devrait pas accepter deux réservations qui se chevauchent
  test("ne devrait pas accepter deux réservations qui se chevauchent", () => {
    // Première réservation
    const result1 = system.reserverSalle(
      salle,
      "2025-12-01",
      "10:00",
      "12:00",
      5
    );

    // Deuxième réservation qui chevauche
    const result2 = system.reserverSalle(
      salle,
      "2025-12-01",
      "11:00",
      "13:00",
      5
    );

    expect(result1).toBe(true);
    expect(result2).toBe(false);
  });

  // Ne devrait pas accepter une date de fin antérieure à la date de début
  test("devrait rejeter une date de fin antérieure à la date de début", () => {
    const result = system.reserverSalle(
      salle,
      "2025-12-01",
      "14:00",
      "13:00",
      5
    );
    expect(result).toBe(false);
  });
});

// Tests pour la validation des noms et capacités des salles
describe("ReservationSystem - validation nom et capacité", () => {
  let system;
  beforeEach(() => {
    system = new ReservationSystem();
  });

  // Tests de validation des noms de salles
  // Refuse d'ajouter une salle avec un nom vide
  test("refuse d'ajouter une salle avec un nom vide", () => {
    expect(() => system.ajouterSalle("", 10)).toThrow(/nom.*vide/i);
  });

  // Refuse d'ajouter une salle avec un nom composé uniquement d'espaces
  test("refuse d'ajouter une salle avec un nom composé uniquement d'espaces", () => {
    expect(() => system.ajouterSalle("   ", 10)).toThrow(/nom.*vide/i);
  });

  // Refuse de modifier le nom d'une salle avec un nom vide
  test("refuse d'ajouter une salle avec une capacité nulle ou négative", () => {
    expect(() => system.ajouterSalle("Salle Vide", 0)).toThrow(
      /capacité.*positif/i
    );
    expect(() => system.ajouterSalle("Salle Négative", -5)).toThrow(
      /capacité.*positif/i
    );
  });

  // Refuse de modifier le nom d'une salle avec un nom vide
  test("refuse de modifier une salle avec une capacité négative", () => {
    system.ajouterSalle("Salle A", 10);
    expect(() => system.modifierSalle("Salle A", { capacite: -5 })).toThrow(
      /capacité.*positif/i
    );
  });
});
