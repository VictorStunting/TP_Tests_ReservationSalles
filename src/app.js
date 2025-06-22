// Classe représentant une salle de réunion
class Salle {
  constructor(nom, capacite) {
    this.nom = nom;
    this.capacite = capacite;
  }
}

// Système de gestion des salles et des réservations
class ReservationSystem {
  constructor() {
    this.salles = [];
    this.reservations = [];
  }

  // ===== Gestion des salles =====
  // Ajoute une salle si le nom n'existe pas déjà
  ajouterSalle(nom, capacite) {
    this._validerNom(nom); // Validation du nom
    const salleExistante = this.trouverSalle(nom);
    if (salleExistante) {
      throw new Error(`La salle ${nom} existe déjà.`);
    }
    this._validerCapacite(capacite);
    const salle = new Salle(nom, capacite);
    this.salles.push(salle);
    return salle;
  }

  // Supprime une salle et ses réservations associées
  supprimerSalle(nom) {
    this.salles = this.salles.filter((salle) => salle.nom !== nom);
    this.reservations = this.reservations.filter(
      (res) => res.salle.nom !== nom
    );
  }

  // Modifie le nom ou la capacité d'une salle
  modifierSalle(nom, changements) {
    const salle = this.trouverSalle(nom);
    if (!salle) return false;

    if (changements.nom) {
      this._validerNom(changements.nom); // Validation du nouveau nom
      const existe = this.salles.find(
        (s) => s.nom === changements.nom && s !== salle
      );
      if (existe) return false;
      salle.nom = changements.nom;
    }

    if (changements.capacite !== undefined) {
      this._validerCapacite(changements.capacite);
      salle.capacite = changements.capacite;
    }

    return true;
  }

  // Trouve une salle par son nom
  trouverSalle(nom) {
    return this.salles.find((s) => s.nom === nom);
  }

  // ===== Gestion des réservations =====
  // Réserve une salle si toutes les règles métier sont respectées
  /*
  reserverSalle(salle, date, heureDebut, heureFin, nombrePersonnes) {
    if (!this._verifierSalleValide(salle, nombrePersonnes)) return false;
    if (!this._verifierHorairesValides(heureDebut, heureFin)) return false;
    if (this._verifierConflit(salle, date, heureDebut, heureFin)) return false;

    const reservation = { salle, date, heureDebut, heureFin, nombrePersonnes };
    this.reservations.push(reservation);
    return true;
  }
  */

  reserverSalle(salle, date, heureDebut, heureFin, nombrePersonnes) {
    // Vérification date de début >= aujourd'hui
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const debut = new Date(`${date}T${heureDebut}`);
    if (debut < now) return false;

    if (!this._verifierSalleValide(salle, nombrePersonnes)) return false;
    if (!this._verifierHorairesValides(heureDebut, heureFin)) return false;
    if (this._verifierConflit(salle, date, heureDebut, heureFin)) return false;

    const reservation = { salle, date, heureDebut, heureFin, nombrePersonnes };
    this.reservations.push(reservation);
    return true;
  }

  // Retourne les réservations pour un jour donné
  getReservationsParJour(date) {
    return this.reservations.filter(
      (r) => r.dateDebut === date || r.date === date
    );
  }

  // Retourne les réservations pour une salle donnée
  getReservationsParSalle(nomSalle) {
    return this.reservations.filter((r) => r.salle.nom === nomSalle);
  }

  // ===== Validations =====
  // Valide la capcité maximale d'une salle
  _validerCapacite(capacite) {
    if (
      typeof capacite !== "number" ||
      !Number.isInteger(capacite) ||
      capacite <= 0
    ) {
      throw new Error("La capacité doit être un entier positif supérieur à 0.");
    }
  }

  // Valide les paramètres d'une salle
  _verifierSalleValide(salle, nombrePersonnes) {
    return salle && nombrePersonnes <= salle.capacite;
  }

  // Valide les horaires d'une réservation
  _verifierHorairesValides(heureDebut, heureFin) {
    if (heureDebut >= heureFin) return false;
    const debut = parseInt(heureDebut.split(":")[0]);
    const fin = parseInt(heureFin.split(":")[0]);
    return debut >= 8 && fin <= 18;
  }

  // Vérifie s'il y a un conflit de réservation
  _verifierConflit(salle, date, heureDebut, heureFin) {
    return this.reservations.some(
      (r) =>
        r.salle.nom === salle.nom &&
        r.date === date &&
        this._chevauchementHoraire(
          r.heureDebut,
          r.heureFin,
          heureDebut,
          heureFin
        )
    );
  }

  // Vérifie si deux créneaux horaires se chevauchent
  _chevauchementHoraire(debut1, fin1, debut2, fin2) {
    return (
      (debut2 >= debut1 && debut2 < fin1) ||
      (fin2 > debut1 && fin2 <= fin1) ||
      (debut2 <= debut1 && fin2 >= fin1)
    );
  }

  // ===== Formatage =====
  // Formate une date au format français
  _formaterDate(date) {
    return new Date(date).toLocaleDateString("fr-FR");
  }

  // Formate une heure au format HH:mm
  _formaterHeure(heure) {
    if (!heure) return "00:00";
    // Si l'heure est déjà au bon format, la retourner
    if (heure.match(/^\d{2}:\d{2}$/)) return heure;

    // Sinon, formater manuellement
    let [h, m] = heure.split(":").map(Number);
    h = h || 0;
    m = m || 0;
    return `${h < 10 ? "0" + h : h}:${m < 10 ? "0" + m : m}`;
  }

  // Valide le nom d'une salle
  _validerNom(nom) {
    if (!nom || nom.trim() === "") {
      throw new Error("Le nom de la salle ne peut pas être vide");
    }
  }
}

// Application front-end
const app = {
  system: new ReservationSystem(),

  // ===== Navigation =====
  // Affiche l'onglet sélectionné et met à jour les contenus
  async showTab(tabName) {
    try {
      document
        .querySelectorAll(".tab-content")
        .forEach((tab) => tab.classList.remove("active"));
      document.getElementById(tabName).classList.add("active");

      if (tabName === "salles") {
        await this.afficherListeSalles();
        await this.mettreAJourSelecteursSalles();
      } else if (tabName === "reservations") {
        await this.mettreAJourSelecteursSalles();
        const salleSelect = document.getElementById("salleReservation");
        if (salleSelect && salleSelect.options.length > 0) {
          await this.afficherReservations();
        }
      }
    } catch (error) {
      console.error("Erreur dans showTab:", error);
      this.afficherAlert("Erreur lors du changement d'onglet", "error");
    }
  },

  // ===== Gestion des salles =====
  // Ajoute une salle
  async ajouterSalle() {
    const nom = document.getElementById("nomSalle").value;
    const capacite = parseInt(document.getElementById("capaciteSalle").value);
    try {
      await api.addSalle({ nom, capacite });
      await this.afficherListeSalles();
      await this.mettreAJourSelecteursSalles();
      document.getElementById("nomSalle").value = "";
      document.getElementById("capaciteSalle").value = "";
      this.afficherAlert("Salle ajoutée", "success");
    } catch (error) {
      this.afficherAlert(error.message, "error");
    }
  },

  // Modifie une salle
  async modifierSalle() {
    try {
      const nomActuel = document.getElementById("salleAModifier").value;
      const nouveauNom = document.getElementById("nouveauNom").value.trim();
      const nouvelleCapacite = parseInt(
        document.getElementById("nouvelleCapacite").value
      );

      if (!nomActuel || !nouvelleCapacite || nouvelleCapacite <= 0) {
        this.afficherAlert("Informations invalides", "error");
        return;
      }

      // Appel API et récupération du succès/échec
      const success = await api.updateSalle(nomActuel, {
        nom: nouveauNom || nomActuel,
        capacite: nouvelleCapacite,
      });

      if (success === false) {
        this.afficherAlert(
          "Impossible de modifier la salle : ce nom existe déjà.",
          "error"
        );
        return;
      }

      await this.afficherListeSalles();
      await this.mettreAJourSelecteursSalles();
      this.afficherAlert("Salle modifiée", "success");
    } catch (error) {
      this.afficherAlert(error.message, "error");
    }
  },

  // Supprime une salle
  async supprimerSalle(nom) {
    if (confirm("Supprimer cette salle ?")) {
      try {
        await api.deleteSalle(nom);
        await this.afficherListeSalles();
        await this.mettreAJourSelecteursSalles();
        this.afficherAlert("Salle supprimée", "success");
      } catch (error) {
        this.afficherAlert(error.message, "error");
      }
    }
  },

  // ===== Gestion des réservations =====
  // Crée une réservation
  async faireReservation() {
    try {
      // Récupération des données du formulaire
      const nomSalle = document.getElementById("salleReservation").value;
      const dateDebut = document.getElementById("dateDebut").value;
      const heureDebut = document.getElementById("heureDebut").value;
      const dateFin = document.getElementById("dateFin").value;
      const heureFin = document.getElementById("heureFin").value;
      const nombrePersonnes = parseInt(
        document.getElementById("nombrePersonnes").value
      );

      // Vérification : date de début >= aujourd'hui
      const now = new Date();
      const debut = new Date(`${dateDebut}T${heureDebut}`);
      now.setHours(0, 0, 0, 0); // ignore l'heure pour la comparaison

      if (debut < now) {
        this.afficherAlert(
          "La date de début ne peut pas être antérieure à aujourd'hui.",
          "error"
        );
        return;
      }

      // Log des données pour débogage
      console.log("Données du formulaire:", {
        nomSalle,
        dateDebut,
        heureDebut,
        dateFin,
        heureFin,
        nombrePersonnes,
      });

      // Séparer la date et l'heure si elles sont au format datetime
      const splitDateTime = (dateTime) => {
        if (dateTime.includes("T")) {
          const [date, time] = dateTime.split("T");
          return { date, time };
        }
        return { date: dateTime, time: null };
      };

      // Séparer les dates et heures
      const debutData = splitDateTime(dateDebut);
      const finData = splitDateTime(dateFin);

      // Validation des données
      if (
        !this._validerDonneesReservation(
          nomSalle,
          dateDebut,
          heureDebut,
          dateFin,
          heureFin,
          nombrePersonnes
        )
      ) {
        return;
      }

      // Vérification de la salle
      const salles = await api.getSalles();
      const salle = salles.find((s) => s.nom === nomSalle);

      // Message d'erreur si la salle n'existe pas
      if (!salle) {
        this.afficherAlert("Salle non trouvée", "error");
        return;
      }

      // Vérification de la capacité
      if (nombrePersonnes > salle.capacite) {
        this.afficherAlert(
          `Le nombre de personnes dépasse la capacité (${salle.capacite})`,
          "error"
        );
        return;
      }

      // Vérification de la disponibilité
      const disponibilite = await api.checkDisponibilite({
        nomSalle,
        dateDebut,
        heureDebut,
        dateFin,
        heureFin,
      });

      // Message d'erreur si la salle n'est pas disponible
      if (!disponibilite) {
        this.afficherAlert(
          "La salle n'est pas disponible sur ce créneau",
          "error"
        );
        return;
      }

      // Création de la réservation
      const reservation = {
        nomSalle,
        dateDebut: debutData.date, // Assurer un format de date valide
        heureDebut: heureDebut, // Assurer un format d'heure valide
        dateFin: finData.date, // Assurer un format de date valide
        heureFin: heureFin, // Assurer un format d'heure valide
        nombrePersonnes,
      };

      // Envoi de la réservation à l'API
      await api.addReservation(reservation);

      // Mise à jour de l'interface
      this.afficherAlert("Réservation effectuée", "success");
      await this.afficherReservations();
      this._viderFormulaireReservation();
    } catch (error) {
      // Log de l'erreur pour débogage
      console.error("Erreur réservation:", error);
      this.afficherAlert(
        error.message || "Erreur lors de la réservation",
        "error"
      );
    }
  },

  // ===== Affichage =====
  // Affiche la liste des salles
  async afficherListeSalles() {
    try {
      const salles = await api.getSalles();
      const container = document.getElementById("listeSalles");

      if (!salles || salles.length === 0) {
        container.innerHTML = "<p>Aucune salle disponible</p>";
        return;
      }

      container.innerHTML = salles
        .map(
          (salle) => `
                <div class="card salle-card">
                    <span class="salle-info">${salle.nom} - ${salle.capacite} personnes</span>
                    <button class="btn-supprimer" onclick="app.supprimerSalle('${salle.nom}')">Supprimer</button>
                </div>
            `
        )
        .join("");
    } catch (error) {
      this.afficherAlert(error.message, "error");
    }
  },

  // Affiche les réservations pour une salle sélectionnée
  async afficherReservations() {
    try {
      const nomSalle = document.getElementById("salleReservation").value;
      const container = document.getElementById("listeReservations");

      console.log("Affichage réservations pour:", nomSalle);

      if (!nomSalle) {
        container.innerHTML = "<p>Veuillez sélectionner une salle</p>";
        return;
      }

      const reservations = await api.getReservationsSalle(nomSalle);
      console.log("Réservations reçues:", reservations);

      // S'assurer que reservations est bien un tableau
      const reservationsArray = Array.isArray(reservations) ? reservations : [];

      if (reservationsArray.length === 0) {
        container.innerHTML = "<p>Aucune réservation pour cette salle</p>";
        return;
      }

      // Trier les réservations par date/heure
      reservationsArray.sort((a, b) => {
        const dateA = new Date(`${a.dateDebut}T${a.heureDebut}`);
        const dateB = new Date(`${b.dateDebut}T${b.heureDebut}`);
        return dateA - dateB;
      });

      // Afficher les réservations avec le bon format de date
      container.innerHTML = reservationsArray
        .map(
          (reservation) => `
            <div class="reservation-card">
                <div class="reservation-details">
                    <div>
                        <strong>Date début:</strong> ${this._formatDateTime(
                          reservation.dateDebut,
                          reservation.heureDebut
                        )}
                    </div>
                    <div>
                        <strong>Date fin:</strong> ${this._formatDateTime(
                          reservation.dateFin,
                          reservation.heureFin
                        )}
                    </div>
                    <div>
                        <strong>Personnes:</strong> ${
                          reservation.nombrePersonnes
                        }
                    </div>
                </div>
            </div>
        `
        )
        .join("");

      // Forcer la mise à jour de l'affichage
      container.style.display = "none";
      //setTimeout(() => container.style.display = 'block', 0);
      requestAnimationFrame(() => {
        container.style.display = "block";
        console.log(
          "Affichage mis à jour avec",
          reservationsArray.length,
          "réservations"
        );
      });
    } catch (error) {
      console.error("Erreur affichage réservations:", error);
      this.afficherAlert("Erreur d'affichage des réservations", "error");
    }
  },

  // Affiche les réservations pour un jour sélectionné
  async afficherReservationsJour() {
    const date = document.getElementById("consultationDate").value;
    if (!date) return this.afficherAlert("Veuillez choisir une date", "error");
    const reservations = await api.getReservationsJour(date);
    document.getElementById("resultatReservationsJour").innerHTML =
      reservations.length
        ? reservations
            .map(
              (r) => `
            <div class="reservation-card">
                <div class="reservation-details">
                    <div><strong>Salle :</strong> ${
                      r.nomSalle || (r.salle && r.salle.nom) || "-"
                    }</div>
                    <div><strong>Début :</strong> ${app._formatDateTime(
                      r.dateDebut,
                      r.heureDebut
                    )}</div>
                    <div><strong>Fin :</strong> ${app._formatDateTime(
                      r.dateFin,
                      r.heureFin
                    )}</div>
                    <div><strong>Personnes :</strong> ${r.nombrePersonnes}</div>
                </div>
            </div>
        `
            )
            .join("")
        : "<p>Aucune réservation ce jour-là.</p>";
  },

  // Affiche les réservations pour une salle sélectionnée
  async afficherReservationsSalle() {
    const nom = document.getElementById("consultationSalle").value;
    if (!nom) return this.afficherAlert("Veuillez choisir une salle", "error");
    const reservations = await api.getReservationsSalle(nom);
    document.getElementById("resultatReservationsSalle").innerHTML =
      reservations.length
        ? reservations
            .map(
              (r) => `
            <div class="reservation-card">
                <div class="reservation-details">
                    <div><strong>Début :</strong> ${app._formatDateTime(
                      r.dateDebut,
                      r.heureDebut
                    )}</div>
                    <div><strong>Fin :</strong> ${app._formatDateTime(
                      r.dateFin,
                      r.heureFin
                    )}</div>
                    <div><strong>Personnes :</strong> ${r.nombrePersonnes}</div>
                </div>
            </div>
        `
            )
            .join("")
        : "<p>Aucune réservation pour cette salle.</p>";
  },

  // Met à jour les sélecteurs de salles dans les différents blocs
  async mettreAJourSelecteursSalles() {
    try {
      const salles = await api.getSalles();

      // --- Bloc modification ---
      const modificationContent = document.getElementById(
        "modificationSalleContent"
      );
      if (modificationContent) {
        if (!salles || salles.length === 0) {
          modificationContent.innerHTML = `<p class="message-info">Aucune salle à modifier</p>`;
        } else {
          modificationContent.innerHTML = `
                        <select id="salleAModifier" onchange="app.chargerDetailsSalle()">
                            ${salles
                              .map(
                                (salle) =>
                                  `<option value="${salle.nom}">${salle.nom} (${salle.capacite} pers.)</option>`
                              )
                              .join("")}
                        </select>
                        <input type="text" id="nouveauNom" placeholder="Nouveau nom">
                        <input type="number" id="nouvelleCapacite" placeholder="Nouvelle capacité">
                        <button onclick="app.modifierSalle()">Modifier</button>
                    `;
          // Préremplir les champs si besoin
          if (salles.length > 0) {
            document.getElementById("nouveauNom").value = salles[0].nom;
            document.getElementById("nouvelleCapacite").value =
              salles[0].capacite;
          }
        }
      }

      // --- Bloc réservation ---
      const options = salles
        .map(
          (salle) =>
            `<option value="${salle.nom}">${salle.nom} (${salle.capacite} pers.)</option>`
        )
        .join("");
      const salleReservation = document.getElementById("salleReservation");
      if (salleReservation) {
        salleReservation.innerHTML = `
                    <option value="">Sélectionnez une salle</option>
                    ${options}
                `;
      }
    } catch (error) {
      console.error("Erreur mise à jour sélecteurs:", error);
      this.afficherAlert("Erreur de mise à jour des sélecteurs", "error");
    }

    // --- Bloc consultation ---
    const salles = await api.getSalles();
    const selectConsult = document.getElementById("consultationSalle");
    if (selectConsult) {
      selectConsult.innerHTML =
        `<option value="">Sélectionnez une salle</option>` +
        salles
          .map(
            (s) =>
              `<option value="${s.nom}">${s.nom} (${s.capacite} pers.)</option>`
          )
          .join("");
    }
  },

  // Charge les détails d'une salle pour modification
  async chargerDetailsSalle() {
    try {
      const nomSalle = document.getElementById("salleAModifier")?.value;
      if (!nomSalle) return;

      const salles = await api.getSalles();
      const salle = salles.find((s) => s.nom === nomSalle);

      if (salle) {
        document.getElementById("nouveauNom").value = salle.nom;
        document.getElementById("nouvelleCapacite").value = salle.capacite;
      }
    } catch (error) {
      console.error("Erreur chargement détails:", error);
      this.afficherAlert("Erreur lors du chargement des détails", "error");
    }
  },

  // ===== Vérifications =====
  async verifierDisponibilite() {
    const params = this._recupererParametresDisponibilite();
    if (!this._parametresDisponibilitesValides(params)) return;

    try {
      const disponible = await api.checkDisponibilite(params);
      this._mettreAJourBoutonReservation(disponible);
    } catch (error) {
      this.afficherAlert(error.message, "error");
    }
  },

  async verifierCapacite() {
    const nomSalle = document.getElementById("salleReservation").value;
    const nombrePersonnes = parseInt(
      document.getElementById("nombrePersonnes").value
    );

    if (!nomSalle || !nombrePersonnes) return;

    try {
      const salles = await api.getSalles();
      const salle = salles.find((s) => s.nom === nomSalle);

      if (salle && nombrePersonnes > salle.capacite) {
        this.afficherAlert(
          `Capacité dépassée (max: ${salle.capacite})`,
          "error"
        );
        document.querySelector(
          'button[onclick="app.faireReservation()"]'
        ).disabled = true;
      } else {
        document.querySelector(
          'button[onclick="app.faireReservation()"]'
        ).disabled = false;
      }
    } catch (error) {
      this.afficherAlert("Erreur de vérification de la capacité", "error");
    }
  },

  // ===== Utilitaires =====
  // Affiche une alerte temporaire
  afficherAlert(message, type) {
    const alerts = document.getElementById("alerts");
    alerts.textContent = message;
    alerts.className = type;
    alerts.style.display = "block";
    setTimeout(() => (alerts.style.display = "none"), 3000);
  },

  // Valide les données de réservation
  _validerDonneesReservation(
    nomSalle,
    dateDebut,
    heureDebut,
    dateFin,
    heureFin,
    nombrePersonnes
  ) {
    if (
      !nomSalle ||
      !dateDebut ||
      !heureDebut ||
      !dateFin ||
      !heureFin ||
      !nombrePersonnes
    ) {
      this.afficherAlert("Tous les champs sont obligatoires", "error");
      return false;
    }

    // Valider le format des heures
    const heureRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!heureRegex.test(heureDebut) || !heureRegex.test(heureFin)) {
      this.afficherAlert("Format d'heure invalide (HH:mm)", "error");
      return false;
    }

    // Valider les dates
    try {
      const debut = new Date(`${dateDebut}T${heureDebut}`);
      const fin = new Date(`${dateFin}T${heureFin}`);

      if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
        this.afficherAlert("Dates invalides", "error");
        return false;
      }

      if (debut >= fin) {
        this.afficherAlert(
          "La date/heure de fin doit être après la date/heure de début",
          "error"
        );
        return false;
      }
    } catch (error) {
      console.error("Erreur validation dates:", error);
      this.afficherAlert("Format de date/heure invalide", "error");
      return false;
    }

    return true;
  },

  // Crée une carte de réservation pour l'affichage
  _creerCarteReservation(reservation) {
    return `
            <div class="reservation-card">
                <div class="reservation-details">
                    <div><strong>Début:</strong> ${this._formatDateTime(
                      reservation.dateDebut,
                      reservation.heureDebut
                    )}</div>
                    <div><strong>Fin:</strong> ${this._formatDateTime(
                      reservation.dateFin,
                      reservation.heureFin
                    )}</div>
                    <div><strong>Personnes:</strong> ${
                      reservation.nombrePersonnes
                    }</div>
                </div>
            </div>
        `;
  },

  // Formate une date au format français
  _formaterHeure(heure) {
    if (!heure) return "00:00";
    // Si l'heure est déjà au bon format, la retourner
    if (typeof heure === "string" && heure.match(/^\d{2}:\d{2}$/)) return heure;

    try {
      // Sinon, formater manuellement
      const [h, m] = (heure || "").split(":").map(Number);
      const heures = h || 0;
      const minutes = m || 0;
      return `${heures < 10 ? "0" + heures : heures}:${
        minutes < 10 ? "0" + minutes : minutes
      }`;
    } catch (error) {
      console.error("Erreur formatage heure:", error);
      return "00:00";
    }
  },

  // Formate une date et une heure en chaîne lisible
  _formatDateTime(date, heure) {
    try {
      if (!date || !heure) {
        console.log("Date ou heure manquante:", { date, heure });
        return "Date/heure non définie";
      }

      // Formatage de l'heure
      let heureFormatted = heure;
      if (!heure.match(/^\d{2}:\d{2}$/)) {
        const [h, m] = heure.split(":");
        heureFormatted = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
      }

      // Formatage de la date
      let dateFormatted = date;
      if (!date.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const [annee, mois, jour] = date.split("-");
        dateFormatted = `${annee}-${mois.padStart(2, "0")}-${jour.padStart(
          2,
          "0"
        )}`;
      }

      console.log("Date et heure formatées:", {
        date: dateFormatted,
        heure: heureFormatted,
      });

      const dateObj = new Date(`${dateFormatted}T${heureFormatted}`);
      if (isNaN(dateObj.getTime())) {
        throw new Error("Date invalide");
      }

      return dateObj.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      console.error("Erreur de formatage date/heure:", error);
      return "Format invalide";
    }
  },

  // Vide le formulaire de réservation
  _viderFormulaireReservation() {
    [
      "dateDebut",
      "heureDebut",
      "dateFin",
      "heureFin",
      "nombrePersonnes",
    ].forEach((id) => {
      document.getElementById(id).value = "";
    });
  },

  // Met à jour le bouton de réservation en fonction de la disponibilité
  _mettreAJourBoutonReservation(disponible) {
    const btn = document.querySelector(
      'button[onclick="app.faireReservation()"]'
    );
    btn.disabled = !disponible;
    btn.textContent = disponible ? "Réserver" : "Salle non disponible";
    btn.classList.toggle("salle-indisponible", !disponible);
  },

  init() {
    this.showTab("salles");
  },

  // Ajouter cette méthode manquante
  _recupererParametresDisponibilite() {
    const nomSalle = document.getElementById("salleReservation").value;
    const dateDebut = document.getElementById("dateDebut").value;
    const heureDebut = document.getElementById("heureDebut").value;
    const dateFin = document.getElementById("dateFin").value;
    const heureFin = document.getElementById("heureFin").value;

    return {
      nomSalle,
      dateDebut,
      heureDebut,
      dateFin,
      heureFin,
    };
  },

  // Ajouter cette méthode de validation
  _parametresDisponibilitesValides(params) {
    const { nomSalle, dateDebut, heureDebut, dateFin, heureFin } = params;
    if (!nomSalle || !dateDebut || !heureDebut || !dateFin || !heureFin) {
      return false;
    }
    return true;
  },
};

// Browser-only initialization
if (typeof window !== "undefined") {
  window.addEventListener("load", () => app.init());
}

// Export for Node.js
if (typeof module !== "undefined" && module.exports) {
  module.exports = { Salle, ReservationSystem, app };
}
