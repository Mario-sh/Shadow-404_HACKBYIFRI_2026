ACADEMIC TWINS - BACKEND DJANGO
================================

Plateforme de gestion académique avec API REST, authentification JWT et IA.

--------------------------------------------------------------------------------
1. PRÉREQUIS
--------------------------------------------------------------------------------

- Python 3.9 ou supérieur
- MySQL / MariaDB (XAMPP, WAMP ou installation séparée)
- Git

--------------------------------------------------------------------------------
2. CLONER LE PROJET
--------------------------------------------------------------------------------

git clone https://github.com/Mario-sh/Shadow-404_HACKBYIFRI_2026.git
cd Shadow-404_HACKBYIFRI_2026/backend

--------------------------------------------------------------------------------
3. ENVIRONNEMENT VIRTUEL
--------------------------------------------------------------------------------

WINDOWS :
python -m venv venv
venv\Scripts\activate

MAC/LINUX :
python3 -m venv venv
source venv/bin/activate

--------------------------------------------------------------------------------
4. INSTALLER LES DÉPENDANCES
--------------------------------------------------------------------------------

pip install -r requirements.txt

--------------------------------------------------------------------------------
5. BASE DE DONNÉES MYSQL
--------------------------------------------------------------------------------

5.1 Démarrer MySQL (XAMPP/WAMP/MySQL service)

5.2 Créer la base de données :

Via phpMyAdmin (http://localhost/phpmyadmin) :
- Cliquer sur "Nouvelle base de données"
- Nom : academic_twins
- Choisir utf8mb4_general_ci
- Cliquer sur "Créer"

OU en ligne de commande :
mysql -u root -p -e "CREATE DATABASE academic_twins CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;"
(mot de passe par défaut : vide, appuyer sur Entrée)

5.3 Importer les données (fichier academic_twins.sql fourni) :

Via phpMyAdmin :
- Sélectionner la base academic_twins
- Onglet "Importer"
- Choisir le fichier academic_twins.sql
- Exécuter

OU en ligne de commande :
mysql -u root -p academic_twins < academic_twins.sql

--------------------------------------------------------------------------------
6. CONFIGURATION (SI NÉCESSAIRE)
--------------------------------------------------------------------------------

Si vous avez besoin de modifier les paramètres de base de données :
backend/backend/settings.py - section DATABASES

Par défaut :
USER: root
PASSWORD: (vide)
HOST: localhost
PORT: 3306

--------------------------------------------------------------------------------
7. MIGRATIONS
--------------------------------------------------------------------------------

python manage.py migrate

--------------------------------------------------------------------------------
8. CRÉER UN SUPERUTILISATEUR (ADMIN)
--------------------------------------------------------------------------------

python manage.py createsuperuser
Suivez les instructions (username, email, password)

--------------------------------------------------------------------------------
9. LANCER LE SERVEUR
--------------------------------------------------------------------------------

python manage.py runserver

Le serveur sera accessible à : http://127.0.0.1:8000/

--------------------------------------------------------------------------------
10. ACCÈS PRINCIPAUX
--------------------------------------------------------------------------------

Administration : http://127.0.0.1:8000/admin/
Documentation API : http://127.0.0.1:8000/swagger/
API de base : http://127.0.0.1:8000/api/

--------------------------------------------------------------------------------
11. PRINCIPAUX ENDPOINTS API
--------------------------------------------------------------------------------

AUTHENTIFICATION :
POST   /api/auth/register/          - Inscription
POST   /api/auth/login/              - Connexion (retourne token JWT)
GET    /api/auth/profile/             - Profil utilisateur

ÉTUDIANTS :
GET    /api/academic/etudiants/      - Liste des étudiants
GET    /api/academic/etudiants/{id}/ - Détail étudiant
GET    /api/academic/etudiants/{id}/notes/ - Notes d'un étudiant
GET    /api/academic/etudiants/{id}/statistiques/ - Stats (moyennes)

NOTES :
GET    /api/academic/notes/          - Liste des notes
GET    /api/academic/notes/?student=1 - Filtrer par étudiant

CLASSES :
GET    /api/academic/classes/        - Liste des classes
GET    /api/academic/classes/{id}/etudiants/ - Étudiants d'une classe

MATIÈRES :
GET    /api/academic/matieres/       - Liste des matières

EXERCICES :
GET    /api/academic/exercices/      - Liste des exercices

RESSOURCES :
GET    /api/academic/ressources/     - Ressources pédagogiques

IA :
GET    /api/ia/suggestions/pour_etudiant/?etudiant_id=1 - Suggestions d'exercices

NOTIFICATIONS :
GET    /api/notifications/           - Mes notifications

--------------------------------------------------------------------------------
12. COMMANDES UTILES
--------------------------------------------------------------------------------

Lister les dépendances : pip list
Créer des migrations : python manage.py makemigrations
Voir les routes : python manage.py show_urls
Lancer les tests : python manage.py test
Shell Django : python manage.py shell

--------------------------------------------------------------------------------
13. DÉPANNAGE
--------------------------------------------------------------------------------

ERREUR "MariaDB 10.6 required" :
Ajouter à la fin de backend/backend/settings.py :
from django.db.backends.mysql.base import DatabaseWrapper
DatabaseWrapper.check_database_version_supported = lambda self: None

ERREUR "Module not found" :
pip install -r requirements.txt

PORTS DÉJÀ UTILISÉS :
python manage.py runserver 8080

RESET BASE DE DONNÉES :
mysql -u root -p -e "DROP DATABASE academic_twins; CREATE DATABASE academic_twins;"
python manage.py migrate

--------------------------------------------------------------------------------
14. CONTACT
--------------------------------------------------------------------------------

Pour toute question, contacter l'équipe backend.

--------------------------------------------------------------------------------
FIN DU README