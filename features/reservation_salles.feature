Feature: Gestion des salles de réunion
  En tant qu'utilisateur, je veux gérer les salles de réunion afin de faciliter l'organisation des réunions.

  Scenario: Ajout d'une nouvelle salle
    Given Un utilisateur veut ajouter une salle nommée "Salle A" avec une capacité de 10 personnes
    When L'utilisateur ajoute cette salle
    Then La salle "Salle A" devrait être ajoutée avec succès

  Scenario: Empêcher l'ajout d'une salle avec un nom vide
    Given Un utilisateur veut ajouter une salle nommée "" avec une capacité de 10 personnes
    When L'utilisateur tente d'ajouter cette salle
    Then L'ajout devrait être refusé avec un message d'erreur "Le nom de la salle ne peut pas être vide"

  Scenario: Empêcher l'ajout d'une salle avec une capacité nulle ou négative
    Given Un utilisateur veut ajouter une salle nommée "Salle Vide" avec une capacité de 0 personnes
    When L'utilisateur tente d'ajouter cette salle
    Then L'ajout devrait être refusé avec un message d'erreur "La capacité doit être un entier positif"



  Scenario: Suppression d'une salle existante
    Given Une salle "Salle A" avec une capacité de 10 personnes existe
    When L'utilisateur supprime la salle "Salle A"
    Then La salle "Salle A" ne devrait plus exister dans la liste des salles



  Scenario: Modification de la capacité d'une salle existante
    Given Une salle "Salle A" avec une capacité de 10 personnes existe
    When L'utilisateur modifie la capacité de la salle "Salle A" à 15 personnes
    Then La salle "Salle A" devrait avoir une capacité de 15 personnes

  Scenario: Modification du nom d'une salle existante
    Given Une salle "Salle A" avec une capacité de 10 personnes existe
    When L'utilisateur modifie le nom de la salle "Salle A" en "Salle B"
    Then La salle "Salle B" devrait exister avec une capacité de 10 personnes
    And La salle "Salle A" ne devrait plus exister



  Scenario: Réservation d'une salle disponible
    Given Une salle "Salle A" avec une capacité de 10 personnes
    When L'utilisateur réserve la salle "Salle A" pour le "2023-10-10" de "09:00" à "10:00" pour 5 personnes
    Then La réservation devrait être confirmée

  Scenario: Empêcher la réservation d'une salle déjà occupée
    Given Une salle "Salle A" déjà réservée le "2023-10-10" de "09:00" à "10:00"
    When L'utilisateur tente de réserver la salle "Salle A" pour le "2023-10-10" de "09:30" à "10:30"
    Then La réservation devrait être refusée en raison d'un conflit d'horaire

  Scenario: Empêcher la réservation d'une salle pour plus de personnes que sa capacité
    Given Une salle "Salle A" avec une capacité de 10 personnes
    When L'utilisateur tente de réserver la salle "Salle A" pour 15 personnes
    Then La réservation devrait être refusée en raison d'une capacité insuffisante



  Scenario: Affichage des réservations pour une journée donnée
    Given Des réservations existantes pour le "2023-10-10"
    When L'utilisateur demande à voir les réservations pour le "2023-10-10"
    Then La liste des réservations pour cette journée devrait être affichée

  Scenario: Empêcher la réservation avec une plage horaire invalide
    Given Une salle "Salle A" avec une capacité de 10 personnes
    When L'utilisateur tente de réserver la salle "Salle A" pour le "2023-10-10" de "14:00" à "13:00"
    Then La réservation devrait être refusée en raison d'une plage horaire invalide

  Scenario: Affichage des réservations d'une salle spécifique
    Given Des réservations existantes pour la salle "Salle A"
    When L'utilisateur demande à voir les réservations de la salle "Salle A"
    Then La liste des réservations pour cette salle devrait être affichée
