# Documentation technique

## Système de Réservation de Salles de Réunion

---

### 1. Architecture du projet

- **Frontend** : HTML/CSS/JS (Vanilla JS)
- **Backend** : Node.js avec Express
- **Tests unitaires** : Jest
- **Tests BDD** : Cucumber.js (Gherkin)
- **Données** : Stockées en mémoire (objet JS), non persistantes

---

### 2. Structure des dossiers

```
.
├── src/                # Code métier (backend)
│   └── app.js
├── server.js           # Serveur Express (API REST)
├── public/             # Fichiers statiques (HTML, CSS, JS front)
├── test/               # Tests unitaires (Jest)
│   └── reservation_salle_reunion.test.js
├── features/           # Scénarios BDD (Cucumber)
│   ├── reservation_salles.feature
│   └── step_definitions/
│       └── reservation_salles.step.js
├── package.json
├── .gitignore
```

---

### 3. Principales classes/fichiers

- **`src/app.js`**
  - Classe `ReservationSystem` :
    - Gestion des salles (ajout, suppression, modification)
    - Gestion des réservations (création, validation, consultation)
    - Règles métier (conflits, capacité, horaires, etc.)
- **`server.js`**
  - Démarre le serveur Express
  - Expose les routes API pour les salles et réservations
- **`public/`**
  - Interface utilisateur (HTML, CSS, JS)
  - Appels à l’API via fetch ou AJAX
- **`test/reservation_salle_reunion.test.js`**
  - Tests unitaires Jest sur toutes les règles métier
- **`features/`**
  - Scénarios Gherkin pour la BDD
  - Steps Cucumber.js pour relier les scénarios au code

---

### 4. Principales routes API

- `GET /api/salles` : liste des salles
- `POST /api/salles` : ajouter une salle
- `PUT /api/salles/:nom` : modifier une salle
- `DELETE /api/salles/:nom` : supprimer une salle
- `GET /api/reservations/jour/:date` : réservations d’un jour
- `GET /api/reservations/salle/:nom` : réservations d’une salle
- `POST /api/reservations` : créer une réservation

---

### 5. Lancement et tests

- **Installer les dépendances** :
  ```sh
  npm install
  ```
- **Lancer le serveur** :

  ```sh
  node server.js
  ```

  Le serveur sera accessible à l’adresse : [http://localhost:3000](http://localhost:3000)

- **Lancer les tests unitaires** :
  ```sh
  npm test
  ```
- **Lancer les tests BDD** :
  ```sh
  npx cucumber-js
  ```

---

### 6. Règles métier principales

- Un nom de salle doit être unique et non vide
- Capacité strictement positive
- Impossible de réserver si :
  - Conflit d’horaire
  - Capacité insuffisante
  - Plage horaire invalide
  - Date passée

---

### 7. Évolutions possibles

- Persistance des données (BDD)
- Authentification utilisateur
- Gestion des notifications
