# Documentation de l'Application E-Suivi (Shadow-404_HACKBYIFRI_2026)

## 1. Introduction et Aperçu Général
E-Suivi est une application web moderne conçue pour la gestion académique avec une architecture découplée. Elle vise à simplifier la gestion des classes, des étudiants, des professeurs, et des notes, tout en offrant une composante innovante grâce à son **moteur d'Intelligence Artificielle** qui génère des suggestions d'exercices personnalisées selon le niveau et les performances de chaque étudiant.

Le système est composé de :
*   **Frontend :** Une application Single Page (SPA) développée en React.js, initialisée avec Vite.
*   **Backend :** Une API RESTful robuste développée avec le framework Django (Python) et Django REST Framework (DRF).

---

## 2. Architecture du Projet

### 2.1 Backend (Django)
Le backend est structuré en plusieurs "apps" modulaires pour séparer les responsabilités métiers :

1.  **`accounts` (Gestion des Comptes et Authentification)**
    *   S'appuie sur `AbstractUser` de Django.
    *   Définit les rôles principaux : `etudiant`, `professeur`, `admin`.
    *   Gère l'authentification par tokens JWT (JSON Web Tokens) via `rest_framework_simplejwt`.

2.  **`academic` (Cœur du Système Académique)**
    *   C'est l'application la plus centrale.
    *   Gère les entités métiers : `Classe`, `Professeur`, `Etudiant`, `Matiere`, `BanqueExercices`, `Note` et `Ressource`.
    *   Expose des endpoints pour gérer les notes (avec validation administrateur), calculer des moyennes, et accéder aux ressources pédagogiques.

3.  **`ai_engine` (Moteur d'Intelligence Artificielle)**
    *   Analyse les performances des étudiants (notes et évolution).
    *   Génère des suggestions intelligentes (`SuggestionExercice`) en recommandant des exercices adaptés au niveau de difficulté approprié.
    *   Le module `SmartSuggestionEngine` orchestre ces recommandations et s'intègre au système de notifications.

4.  **`notifications` (Système d'Alertes)**
    *   Permet d'envoyer des notifications ciblées aux utilisateurs (suggestions d'exercices, rappels, validations de notes).
    *   Utilise le type générique de Django (`ContentType`) pour lier une notification à n'importe quel autre objet (comme une suggestion ou une note).

### 2.2 Frontend (React + Vite)
*   **Technologies :** React.js pour la logique de l'interface, et Tailwind CSS (présumé via la documentation `Vite` standard d'E-Suivi) pour le stylisme des composants.
*   **État Actuel :** Le frontend repose sur une structure de base (`App.jsx`, `main.jsx`). Il est configuré pour communiquer facilement avec le backend via des appels HTTP (Fetch ou Axios) vers les endpoints de l'API REST.

---

## 3. Modèles de Données (Base de Données)

### `accounts`
*   **`User` :** Hérite de `AbstractUser`. Ajoute le rôle (`role`), la filière, le niveau et le numéro étudiant.

### `academic`
*   **`Administrateur`**, **`Professeur`**, **`Etudiant`** : Représentent les acteurs du système. Un étudiant est toujours rattaché à une `Classe`.
*   **`Classe` :** Définit un groupe d'élèves selon un niveau.
*   **`Matiere` :** Les matières suivies, avec leur coefficient.
*   **`BanqueExercices` :** Les exercices créés par les professeurs, catégorisés par niveau de difficulté (1: Facile, 2: Moyen, 3: Difficile).
*   **`Note` :** L'évaluation d'un étudiant dans une matière via un `type_evaluation` (devoir, tp, examen). Une note doit être **validée** avant d'être officielle.
*   **`Ressource` :** Fichiers pédagogiques (PDF, vidéo, etc.) mis en ligne par l'administrateur pour une matière donnée.

### `ai_engine`
*   **`ModeleIA` :** Registre des modèles d'IA entraînés.
*   **`SuggestionExercice` :** Historique des suggestions créées par l'IA pour un étudiant. Recommande un exercice de la `BanqueExercices` selon une analyse (la `raison`).
*   **`StatistiqueApprentissage` :** Agrégation des résultats (taux de réussite, exercices réalisés) pour affiner les suggestions.

### `notifications`
*   **`Notification` :** Message envoyé à un utilisateur (statut "non lu" ou "lu").

---

## 4. API Endpoints (Routes REST)

L'API est documentée via Swagger (`/swagger/`) et ReDoc (`/redoc/`). Voici les principales routes de fonctionnement :

### Authentification (`/api/auth/`)
*   `POST /api/auth/register/` : Inscription d'un nouvel utilisateur.
*   `POST /api/auth/login/` : Connexion (retourne les JWT Access et Refresh).
*   `POST /api/auth/logout/` : Déconnexion (blacklist le refresh token).
*   `GET/PUT /api/auth/profile/` : Lire et modifier son propre profil.

### Académique (`/api/academic/`)
*Routes gérées par des ViewSets (Supportent GET, POST, PUT, DELETE selon les permissions)*
*   `/api/academic/etudiants/` : Gestion des étudiants.
    *   `/etudiants/{id}/notes/` : Voir les notes d'un étudiant.
    *   `/etudiants/{id}/statistiques/` : Voir la moyenne, matière forte/faible.
    *   `/etudiants/{id}/suggestions/` : Récupérer les 10 dernières suggestions d'IA.
*   `/api/academic/professeurs/` : Gestion des enseignants.
*   `/api/academic/classes/` : Gestion des classes (et leurs statistiques).
*   `/api/academic/matieres/` : Gestion des matières (et leurs statistiques).
*   `/api/academic/exercices/` : Banque d'exercices classés par difficulté.
*   `/api/academic/notes/` : Création et gestion des notes.
    *   `POST /notes/{id}/valider/` : Action d'admin pour officialiser une note et notifier l'étudiant.
*   `/api/academic/ressources/` : Documents PDF et liens vidéos.

### Moteur d'IA (`/api/ia/`)
*   `GET /api/ia/smart-suggestions/pour_etudiant/?etudiant_id={id}` : Appelle l'IA pour analyser les performances de l'étudiant et lui générer/affecter des suggestions d'exercices sur-mesure.
*   `GET /api/ia/smart-suggestions/analyse_complete/?etudiant_id={id}` : Renvoie un audit complet du niveau de l'étudiant sans créer de nouvelle suggestion.
*   `POST /api/ia/smart-suggestions/feedback/` : L'étudiant peut indiquer si l'exercice suggéré a été utile.

### Notifications (`/api/notifications/`)
*   `GET /api/notifications/non_lues/` : Lise des alertes en attente.
*   `POST /api/notifications/marquer_tout_lu/` : Tout archiver comme lu.

---

## 5. Fonctionnement Sécuritaire (Permissions)
Le backend intègre un contrôle d'accès basé sur les rôles (RBAC) :
*   **Admins** ont un droit de création/suppression total et peuvent valider les notes inscrites au dossier.
*   **Professeurs** peuvent créer/mettre à jour des étudiants, des matières, des exercices et des notes, mais ne peuvent pas en supprimer ou gérer les autres professeurs.
*   **Étudiants** ont un accès en lecture seule (`ReadOnly`) aux entités qui les concernent et peuvent consulter leurs suggestions et statistiques.

---

## 6. Workflow de l'Intelligence Artificielle
1.  Un appel API est fait pour obtenir des suggestions (`/api/ia/smart-suggestions/pour_etudiant/`).
2.  La vue initialise le `SmartSuggestionEngine` pour cet étudiant.
3.  L'IA calcule la moyenne générale, observe l'évolution des notes par matière, et détecte les "matières à risque" (Notes faibles ou en chute).
4.  Le moteur sélectionne, dans la table `BanqueExercices`, des exercices pertinents (ex: niveau de difficulté "Facile" si la matière est très faible, "Difficile" si l'élève performe déjà bien).
5.  Les suggestions sont enregistrées en base locale (`SuggestionExercice`) et une `Notification` d'alerte est directement envoyée à l'étudiant pour l'inviter à s'entraîner.
6.  L'étudiant consulte la suggestion et y répond via feedback, ce qui affine les futures recommandations.

---

## 7. Instructions d'Installation et Lancement

### Backend (Django)
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python manage.py makemigrations
python manage.py migrate
python manage.py runserver
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev
```

> **Note de développement:** L'application est prête à intégrer l'intelligence artificielle en production. Il suffit d'enrichir le frontend REACT pour qu'il consomme les API documentées et rende accessible aux utilisateurs la pleine valeur des parcours suggérés par l'IA.
