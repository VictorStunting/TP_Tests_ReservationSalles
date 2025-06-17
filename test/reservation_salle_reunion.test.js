const { ReservationSystem } = require('../src/app');

describe('ReservationSystem - gestion des salles et réservations', () => {
  let system;
  let salle;

  beforeEach(() => {
    system = new ReservationSystem();
  });


  //Ajout de salle
  test('ajouter une salle crée bien la salle avec son nom et sa capacité', () => {
    const salle = system.ajouterSalle('Salle A', 20);
    expect(salle.nom).toBe('Salle A');
    expect(salle.capacite).toBe(20);
  });

  //Suppression d'une salle
  test('supprimer une salle existante', () => {
    system.ajouterSalle('Salle A', 10);
    let salle = system.trouverSalle('Salle A');
    expect(salle).toBeDefined();

    system.supprimerSalle('Salle A');
    salle = system.trouverSalle('Salle A');
    expect(salle).toBeUndefined();
  });

  test('supprimer une salle non existante', () => {
    system.ajouterSalle('Salle A', 10);
    let salle = system.trouverSalle('Salle A');
    expect(salle).toBeDefined();

    system.supprimerSalle('Salle C');
    salle = system.trouverSalle('Salle C');
    expect(salle).toBeUndefined();
  });





  //Modification de salle
  test('modifier le nom d\'une salle existante', () => {
    system.ajouterSalle('Salle A', 10);
    system.modifierNomSalle('Salle A', 'Salle B');
    const ancienneSalle = system.trouverSalle('Salle A');
    const nouvelleSalle = system.trouverSalle('Salle B');
    expect(ancienneSalle).toBeUndefined();
    expect(nouvelleSalle).toBeDefined();
    expect(nouvelleSalle.capacite).toBe(10);
  });

  test('modifier la capacité d\'une salle existante', () => {
    system.ajouterSalle('Salle A', 10);
    system.modifierCapaciteSalle('Salle A', 15);
    const salle = system.trouverSalle('Salle A');
    expect(salle.capacite).toBe(15);
  });


  //Réservation de salle
  test('réserver une salle avec une capacité suffisante réussit', () => {
    system.ajouterSalle('Salle A', 20);
    const salle = system.trouverSalle('Salle A');
    const result = system.reserverSalle(salle, '2025-06-20', '09:00', '10:00', 15);
    expect(result).toBe(true);
  });

  test('réserver une salle avec une capacité insuffisante échoue', () => {
    system.ajouterSalle('Salle A', 10);
    const salle = system.trouverSalle('Salle A');
    const result = system.reserverSalle(salle, '2025-06-20', '09:00', '10:00', 15);
    expect(result).toBe(false);
  });

  test('réserver une salle avec un conflit d\'horaire échoue', () => {
    system.ajouterSalle('Salle A', 10);
    const salle = system.trouverSalle('Salle A');
    system.reserverSalle(salle, '2025-06-20', '09:00', '10:00', 5);
    const result = system.reserverSalle(salle, '2025-06-20', '09:30', '10:30', 5);
    expect(result).toBe(false);
  });

  test('réserver une salle avec une plage horaire invalide échoue', () => {
    system.ajouterSalle('Salle A', 10);
    const salle = system.trouverSalle('Salle A');
    const result = system.reserverSalle(salle, '2025-06-20', '10:00', '09:00', 5);
    expect(result).toBe(false);
  });


  //Consultation de salle
  test('obtenir les réservations pour un jour donné renvoie la bonne liste', () => {
    system.ajouterSalle('Salle A', 10);
    const salle = system.trouverSalle('Salle A');
    system.reserverSalle(salle, '2025-06-20', '09:00', '10:00', 5);
    const reservations = system.getReservationsParJour('2025-06-20');
    expect(reservations.length).toBe(1);
    expect(reservations[0].salle.nom).toBe('Salle A');
  });

  test('obtenir les réservations d\'une salle spécifique', () => {
    system.ajouterSalle('Salle A', 10);
    const salleA = system.trouverSalle('Salle A');

    system.reserverSalle(salleA, '2025-06-20', '09:00', '10:00', 5);

    const reservationsSalleA = system.getReservationsParSalle('Salle A');
    expect(reservationsSalleA.length).toBe(1);
    expect(reservationsSalleA[0].salle.nom).toBe('Salle A');
  });
});



describe('ReservationSystem - Validations avancées des dates et heures', () => {
    let system;
    let salle;

    beforeEach(() => {
        system = new ReservationSystem();
        system.ajouterSalle("SalleTest", 10);
        salle = system.trouverSalle("SalleTest");
    });

    test('ne devrait pas accepter une réservation dans le passé', () => {
        const datePassee = new Date();
        datePassee.setDate(datePassee.getDate() - 1);
        const result = system.reserverSalle(
            salle,
            datePassee.toISOString().split('T')[0],
            '10:00',
            '11:00',
            5
        );
        expect(result).toBe(false);
    });

    test('ne devrait pas accepter une réservation avant 8h', () => {
        const result = system.reserverSalle(
            salle,
            '2025-12-01',
            '07:00',
            '09:00',
            5
        );
        expect(result).toBe(false);
    });

    test('ne devrait pas accepter une réservation après 18h', () => {
        const result = system.reserverSalle(
            salle,
            '2025-12-01',
            '17:00',
            '19:00',
            5
        );
        expect(result).toBe(false);
    });

    test('ne devrait pas accepter une réservation de moins de 30 minutes', () => {
        const result = system.reserverSalle(
            salle,
            '2025-12-01',
            '10:00',
            '10:15',
            5
        );
        expect(result).toBe(false);
    });

    test('devrait accepter une réservation valide dans les horaires normaux', () => {
        const result = system.reserverSalle(
            salle,
            '2025-12-01',
            '09:00',
            '11:00',
            5
        );
        expect(result).toBe(true);
    });

    test('ne devrait pas accepter deux réservations qui se chevauchent', () => {
        // Première réservation
        const result1 = system.reserverSalle(
            salle,
            '2025-12-01',
            '10:00',
            '12:00',
            5
        );
        
        // Deuxième réservation qui chevauche
        const result2 = system.reserverSalle(
            salle,
            '2025-12-01',
            '11:00',
            '13:00',
            5
        );

        expect(result1).toBe(true);
        expect(result2).toBe(false);
    });

    test('devrait rejeter une réservation sur plusieurs jours', () => {
        const result = system.reserverSalle(
            salle,
            '2025-12-01',
            '14:00',
            '10:00', // Le lendemain implicitement
            5
        );
        expect(result).toBe(false);
    });

    test('devrait rejeter une date de fin antérieure à la date de début', () => {
        const result = system.reserverSalle(
            salle,
            '2025-12-01',
            '14:00',
            '13:00',
            5
        );
        expect(result).toBe(false);
    });
});