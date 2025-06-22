/*
class Salle {
  constructor(nom, capacite) {
    this.nom = nom;
    this.capacite = capacite;
  }
}

class ReservationSystem {
  constructor() {
    this.salles = [];
    this.reservations = [];
  }


  _validerCapacite(capacite) {
    if (typeof capacite !== 'number' || !Number.isInteger(capacite) || capacite <= 0) {
      throw new Error("La capacité doit être un entier positif supérieur à 0.");
    }
  }



  ajouterSalle(nom, capacite) {
    const salleExistante = this.trouverSalle(nom);
    if (salleExistante) {
      throw new Error(`La salle ${nom} existe déjà.`);
    }
    
    this._validerCapacite(capacite);

    const salle = new Salle(nom, capacite);
    this.salles.push(salle);
    return salle;
  }

  supprimerSalle(nom) {
    this.salles = this.salles.filter(salle => salle.nom !== nom);
    // Aussi supprimer les réservations associées
    this.reservations = this.reservations.filter(res => res.salle.nom !== nom);
  }

  //Modifier Salle globale -> Fonctions en dessous pour modifier les noms et les capacités
  modifierSalle(nom, changements) {
    const salle = this.trouverSalle(nom);
    if (!salle) return false;

    if (changements.nom) {
      // Vérifier qu'on ne duplique pas un nom existant
      const existe = this.trouverSalle(changements.nom);
      if (existe) return false; 
      salle.nom = changements.nom;
    }

    if (changements.capacite !== undefined) {
      this._validerCapacite(changements.capacite);
      salle.capacite = changements.capacite;
    }

    return true;
  }

  

  modifierCapaciteSalle(nom, nouvelleCapacite) {
    const salle = this.trouverSalle(nom);
    if (!salle) return false;
    this._validerCapacite(capacite);
    salle.capacite = nouvelleCapacite;
    return true;
  }
  

  modifierNomSalle(nomActuel, nouveauNom) {
    const salle = this.trouverSalle(nomActuel);
    if (!salle) return false;

    if (nouveauNom != nomActuel) {
      // Vérifier qu'on ne duplique pas un nom existant
      const existe = this.trouverSalle(nouveauNom);
      if (existe) return false; 

      salle.nom = nouveauNom;
      return true;
    }
    return false;
  }

  //Trouver une salle
  trouverSalle(nom) {
    return this.salles.find(s => s.nom === nom);
  }

  //Réservation:
  reserverSalle(salle, date, heureDebut, heureFin, nombrePersonnes) {
    if (!salle) return false;

    if (nombrePersonnes > salle.capacite) {
      return false;
    }

    if (heureDebut >= heureFin) {
      return false;
    }

    const conflitHoraire = this.reservations.some(reservation =>
      reservation.salle.nom === salle.nom &&
      reservation.date === date &&
      ((heureDebut >= reservation.heureDebut && heureDebut < reservation.heureFin) ||
       (heureFin > reservation.heureDebut && heureFin <= reservation.heureFin  ||
       (heureDebut <= reservation.heureDebut && heureFin >= reservation.heureFin))
      )
    );

    if (conflitHoraire) {
      return false;
    }

    const reservation = { salle, date, heureDebut, heureFin, nombrePersonnes };
    this.reservations.push(reservation);
    return true;
  }


  //Get
  getReservationsParJour(date) {
    return this.reservations.filter(reservation => reservation.date === date);
  }

  getReservationsParSalle(nomSalle) {
    return this.reservations.filter(r => r.salle.nom === nomSalle);
  }
}

module.exports = { Salle, ReservationSystem };

*/