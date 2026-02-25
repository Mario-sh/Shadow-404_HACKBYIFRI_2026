#!/usr/bin/env python
"""
Script de peuplement de la base de données Academic Twins.
Exécuter avec: python populate_db.py
"""

import os
import sys
import django
import random
from datetime import datetime, timedelta, date

# Configuration de Django
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

# Imports Django
from django.contrib.auth import get_user_model
from django.utils import timezone
from apps.academic.models import (
    Etudiant, Professeur, Administrateur, Classe, Matiere,
    Note, Ressource, BanqueExercices
)
from apps.accounts.models import User
from apps.ai_engine.models import SuggestionExercice, StatistiqueApprentissage
from apps.notifications.models import Notification
from apps.events.models import Event
from apps.logs.models import Log

# ============================================
# CONFIGURATION
# ============================================
MOT_DE_PASSE_PAR_DEFAUT = "password123"


def print_header(titre):
    """Affiche un en-tête de section"""
    print("\n" + "=" * 60)
    print(f" {titre}")
    print("=" * 60)


def print_success(message):
    """Affiche un message de succès"""
    print(f"✅ {message}")


def print_info(message):
    """Affiche un message d'information"""
    print(f"ℹ️ {message}")


def print_warning(message):
    """Affiche un avertissement"""
    print(f"⚠️ {message}")


# ============================================
# 1. CRÉATION DES UTILISATEURS
# ============================================
def create_users():
    """Crée tous les utilisateurs (admin, professeurs, étudiants)"""
    print_header("CRÉATION DES UTILISATEURS")

    User = get_user_model()
    users_created = 0

    # 1.1 Admin
    admin_data = {
        'username': 'admin',
        'email': 'admin@academictwins.com',
        'password': MOT_DE_PASSE_PAR_DEFAUT,
        'role': 'admin',
        'telephone': '+229 01 23 45 67',
        'is_superuser': True,
        'is_staff': True,
        'is_active': True,
    }

    admin, created = User.objects.get_or_create(
        username='admin',
        defaults=admin_data
    )
    if created:
        admin.set_password(MOT_DE_PASSE_PAR_DEFAUT)
        admin.save()
        print_success(f"Admin créé: admin / {MOT_DE_PASSE_PAR_DEFAUT}")
        users_created += 1
    else:
        print_info("L'admin existe déjà")

    # 1.2 Professeurs (5 profs)
    professeurs_data = [
        {'username': 'prof.math', 'email': 'mathieu.dubois@academic.com', 'prenom': 'Mathieu', 'nom': 'Dubois',
         'specialite': 'Mathématiques'},
        {'username': 'prof.physique', 'email': 'sophie.martin@academic.com', 'prenom': 'Sophie', 'nom': 'Martin',
         'specialite': 'Physique'},
        {'username': 'prof.francais', 'email': 'claire.bernard@academic.com', 'prenom': 'Claire', 'nom': 'Bernard',
         'specialite': 'Français'},
        {'username': 'prof.anglais', 'email': 'thomas.petit@academic.com', 'prenom': 'Thomas', 'nom': 'Petit',
         'specialite': 'Anglais'},
        {'username': 'prof.info', 'email': 'julie.rousseau@academic.com', 'prenom': 'Julie', 'nom': 'Rousseau',
         'specialite': 'Informatique'},
    ]

    for prof_data in professeurs_data:
        username = prof_data['username']
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': prof_data['email'],
                'role': 'professeur',
                'telephone': f'+22997 {random.randint(10, 99)} {random.randint(10, 99)} {random.randint(10, 99)}',
                'is_active': True,
            }
        )
        if created:
            user.set_password(MOT_DE_PASSE_PAR_DEFAUT)
            user.save()
            print_success(f"Professeur créé: {username} / {MOT_DE_PASSE_PAR_DEFAUT}")
            users_created += 1

            # Créer aussi dans la table Professeur
            professeur, _ = Professeur.objects.get_or_create(
                email=prof_data['email'],
                defaults={
                    'nom_prof': prof_data['nom'],
                    'prenom_prof': prof_data['prenom'],
                    'specialite': prof_data['specialite'],
                }
            )
            print_success(f"  → Enregistré dans table professeur: {professeur.prenom_prof} {professeur.nom_prof}")
        else:
            print_info(f"Professeur {username} existe déjà")

    # 1.3 Étudiants (15 étudiants)
    filieres = ['Informatique', 'Gestion', 'Médecine', 'Droit', 'Lettres']
    niveaux = ['L1', 'L2', 'L3', 'M1', 'M2']

    noms_prenoms = [
        ('Konan', 'Jean'), ('Kouassi', 'Marie'), ('Bamba', 'Paul'), ('Traoré', 'Fatou'),
        ('Coulibaly', 'Amadou'), ('Diallo', 'Aminata'), ('Touré', 'Moussa'),
        ('Ouattara', 'Awa'), ('Koffi', 'Emile'), ('N\'Guessan', 'Patricia'),
        ('Yao', 'Hermann'), ('Amani', 'Christelle'), ('Kouadio', 'Franck'),
        ('Tano', 'Rachel'), ('Ahoussou', 'Kevin'), ('Diarra', 'Mariam'),
    ]

    for i, (nom, prenom) in enumerate(noms_prenoms[:15]):
        username = f"{prenom.lower()}.{nom.lower()}"
        email = f"{prenom.lower()}.{nom.lower()}@etudiant.com"
        filiere = random.choice(filieres)
        niveau = random.choice(niveaux)
        numero = f"20{random.randint(22, 26)}{random.randint(100, 999):03d}"

        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': email,
                'role': 'etudiant',
                'filiere': filiere,
                'niveau': niveau,
                'numero_etudiant': numero,
                'telephone': f'+22996 {random.randint(10, 99)} {random.randint(10, 99)} {random.randint(10, 99)}',
                'is_active': True,
            }
        )
        if created:
            user.set_password(MOT_DE_PASSE_PAR_DEFAUT)
            user.save()
            print_success(f"Étudiant créé: {username} / {MOT_DE_PASSE_PAR_DEFAUT} ({filiere} {niveau})")
            users_created += 1

            # L'étudiant sera créé automatiquement par RegisterView plus tard
            # On le crée manuellement ici pour le script
            try:
                # Trouver une classe
                classe = Classe.objects.filter(niveau__icontains=niveau).first()

                etudiant, _ = Etudiant.objects.get_or_create(
                    user=user,
                    defaults={
                        'matricule': numero,
                        'nom': nom,
                        'prenom': prenom,
                        'email': email,
                        'date_inscription': date.today() - timedelta(days=random.randint(30, 365)),
                        'classe': classe,
                    }
                )
                print_success(f"  → Enregistré dans table etudiant: {etudiant.prenom} {etudiant.nom}")
            except Exception as e:
                print_warning(f"  → Impossible de créer l'étudiant dans academic: {str(e)}")
        else:
            print_info(f"Étudiant {username} existe déjà")

    return users_created


# ============================================
# 2. CRÉATION DES CLASSES
# ============================================
def create_classes():
    """Crée les classes"""
    print_header("CRÉATION DES CLASSES")

    classes_data = [
        {'nom_class': 'Informatique Réseaux Télécommunication - 1ère année', 'niveau': 'L1'},
        {'nom_class': 'Informatique Réseaux Télécommunication - 2ème année', 'niveau': 'L2'},
        {'nom_class': 'Informatique Réseaux Télécommunication - 3ème année', 'niveau': 'L3'},
        {'nom_class': 'Sciences de Gestion - 1ère année', 'niveau': 'L1'},
        {'nom_class': 'Sciences de Gestion - 2ème année', 'niveau': 'L2'},
        {'nom_class': 'Sciences de Gestion - 3ème année', 'niveau': 'L3'},
        {'nom_class': 'Médecine - 1ère année', 'niveau': 'L1'},
        {'nom_class': 'Médecine - 2ème année', 'niveau': 'L2'},
        {'nom_class': 'Droit - 1ère année', 'niveau': 'L1'},
        {'nom_class': 'Droit - 2ème année', 'niveau': 'L2'},
        {'nom_class': 'Lettres Modernes - 1ère année', 'niveau': 'L1'},
        {'nom_class': 'Lettres Modernes - 2ème année', 'niveau': 'L2'},
    ]

    count = 0
    for data in classes_data:
        classe, created = Classe.objects.get_or_create(
            nom_class=data['nom_class'],
            defaults={'niveau': data['niveau']}
        )
        if created:
            print_success(f"Classe créée: {classe.nom_class}")
            count += 1

    if count == 0:
        print_info("Toutes les classes existent déjà")
    return count


# ============================================
# 3. CRÉATION DES MATIÈRES
# ============================================
def create_matieres():
    """Crée les matières"""
    print_header("CRÉATION DES MATIÈRES")

    matieres_data = [
        {'nom': 'Algorithme', 'coefficient': 3},
        {'nom': 'Algèbre', 'coefficient': 3},
        {'nom': 'Base de données', 'coefficient': 4},
        {'nom': 'Mathématiques', 'coefficient': 4},
        {'nom': 'Physique', 'coefficient': 3},
        {'nom': 'Chimie', 'coefficient': 2},
        {'nom': 'Français', 'coefficient': 2},
        {'nom': 'Anglais', 'coefficient': 2},
        {'nom': 'Histoire', 'coefficient': 2},
        {'nom': 'Géographie', 'coefficient': 2},
        {'nom': 'Philosophie', 'coefficient': 2},
        {'nom': 'Programmation Web', 'coefficient': 3},
        {'nom': 'Réseaux', 'coefficient': 3},
        {'nom': 'Systèmes d\'exploitation', 'coefficient': 3},
    ]

    count = 0
    for data in matieres_data:
        matiere, created = Matiere.objects.get_or_create(
            nom_matière=data['nom'],
            defaults={'coefficient': data['coefficient']}
        )
        if created:
            print_success(f"Matière créée: {matiere.nom_matière} (coef {matiere.coefficient})")
            count += 1

    if count == 0:
        print_info("Toutes les matières existent déjà")
    return count


# ============================================
# 4. CRÉATION DES ADMINISTRATEURS
# ============================================
def create_administrateurs():
    """Crée les administrateurs dans la table spécifique"""
    print_header("CRÉATION DES ADMINISTRATEURS")

    admins_data = [
        {'nom': 'HOUNKPATIN', 'prenom': 'George', 'email': 'george.hounkpatin@admin.com'},
        {'nom': 'ADJOVI', 'prenom': 'Marc', 'email': 'marc.adjovi@admin.com'},
    ]

    count = 0
    for data in admins_data:
        admin, created = Administrateur.objects.get_or_create(
            email=data['email'],
            defaults={
                'nom': data['nom'],
                'prenom': data['prenom'],
                'mot_de_passe': 'MotDePasseSecurisé123',
            }
        )
        if created:
            print_success(f"Admin créé: {admin.prenom} {admin.nom}")
            count += 1

    if count == 0:
        print_info("Tous les administrateurs existent déjà")
    return count


# ============================================
# 5. CRÉATION DES EXERCICES
# ============================================
def create_exercices():
    """Crée des exercices dans la banque d'exercices"""
    print_header("CRÉATION DES EXERCICES")

    # Récupérer les matières
    matieres = {m.nom_matière: m for m in Matiere.objects.all()}
    if not matieres:
        print_warning("Aucune matière trouvée. Créez d'abord les matières.")
        return 0

    # Récupérer un professeur
    professeur = Professeur.objects.first()
    if not professeur:
        print_warning("Aucun professeur trouvé. Créez d'abord les professeurs.")
        return 0

    exercices_data = [
        # Mathématiques
        {
            'titre': 'Équations du premier degré',
            'niveau_difficulte': 1,
            'subject_nom': 'Mathématiques',
        },
        {
            'titre': 'Systèmes d\'équations linéaires',
            'niveau_difficulte': 2,
            'subject_nom': 'Mathématiques',
        },
        {
            'titre': 'Dérivées et applications',
            'niveau_difficulte': 3,
            'subject_nom': 'Mathématiques',
        },
        # Algorithme
        {
            'titre': 'Les structures conditionnelles',
            'niveau_difficulte': 1,
            'subject_nom': 'Algorithme',
        },
        {
            'titre': 'Les boucles (for, while)',
            'niveau_difficulte': 2,
            'subject_nom': 'Algorithme',
        },
        {
            'titre': 'Algorithmes de tri avancés',
            'niveau_difficulte': 3,
            'subject_nom': 'Algorithme',
        },
        # Base de données
        {
            'titre': 'Requêtes SQL simples',
            'niveau_difficulte': 1,
            'subject_nom': 'Base de données',
        },
        {
            'titre': 'Jointures SQL',
            'niveau_difficulte': 2,
            'subject_nom': 'Base de données',
        },
        {
            'titre': 'Optimisation de requêtes',
            'niveau_difficulte': 3,
            'subject_nom': 'Base de données',
        },
        # Physique
        {
            'titre': 'Lois de Newton',
            'niveau_difficulte': 1,
            'subject_nom': 'Physique',
        },
        {
            'titre': 'Circuits électriques',
            'niveau_difficulte': 2,
            'subject_nom': 'Physique',
        },
        {
            'titre': 'Mécanique quantique',
            'niveau_difficulte': 3,
            'subject_nom': 'Physique',
        },
        # Anglais
        {
            'titre': 'English Tenses',
            'niveau_difficulte': 1,
            'subject_nom': 'Anglais',
        },
        {
            'titre': 'Business English',
            'niveau_difficulte': 2,
            'subject_nom': 'Anglais',
        },
        {
            'titre': 'Advanced Essay Writing',
            'niveau_difficulte': 3,
            'subject_nom': 'Anglais',
        },
    ]

    count = 0
    for data in exercices_data:
        matiere = matieres.get(data['subject_nom'])
        if not matiere:
            print_warning(f"Matière non trouvée: {data['subject_nom']}")
            continue

        exercice, created = BanqueExercices.objects.get_or_create(
            titre=data['titre'],
            defaults={
                'niveau_difficulte': data['niveau_difficulte'],
                'fichier_url': f'/media/exercices/{data["titre"].lower().replace(" ", "_")}.pdf',
                'subject': matiere,
                'cree_par': professeur,
            }
        )
        if created:
            print_success(
                f"Exercice créé: {exercice.titre} ({matiere.nom_matière}) - Niveau {exercice.niveau_difficulte}")
            count += 1

    if count == 0:
        print_info("Tous les exercices existent déjà")
    return count


# ============================================
# 6. CRÉATION DES RESSOURCES
# ============================================
def create_ressources():
    """Crée des ressources pédagogiques"""
    print_header("CRÉATION DES RESSOURCES")

    # Récupérer les matières
    matieres = {m.nom_matière: m for m in Matiere.objects.all()}
    if not matieres:
        print_warning("Aucune matière trouvée. Créez d'abord les matières.")
        return 0

    # Récupérer un admin
    admin = Administrateur.objects.first()
    if not admin:
        print_warning("Aucun admin trouvé. Créez d'abord les administrateurs.")
        return 0

    types_ressources = ['pdf', 'video', 'lien', 'image', 'audio', 'presentation']

    ressources_data = [
        {'titre': 'Cours complet - Algorithmique', 'type': 'pdf', 'subject_nom': 'Algorithme'},
        {'titre': 'Cours - Base de données', 'type': 'pdf', 'subject_nom': 'Base de données'},
        {'titre': 'Introduction à Python (vidéo)', 'type': 'video', 'subject_nom': 'Algorithme'},
        {'titre': 'Chaîne YouTube Maths', 'type': 'lien', 'subject_nom': 'Mathématiques'},
        {'titre': 'Formulaire de physique', 'type': 'pdf', 'subject_nom': 'Physique'},
        {'titre': 'Tableau périodique', 'type': 'image', 'subject_nom': 'Chimie'},
        {'titre': 'Podcast - Grammaire anglaise', 'type': 'audio', 'subject_nom': 'Anglais'},
        {'titre': 'Cours - Réseaux', 'type': 'presentation', 'subject_nom': 'Réseaux'},
        {'titre': 'Exercices SQL corrigés', 'type': 'pdf', 'subject_nom': 'Base de données'},
        {'titre': 'Cours - Systèmes d\'exploitation', 'type': 'pdf', 'subject_nom': 'Systèmes d\'exploitation'},
        {'titre': 'Playlist YouTube - Programmation', 'type': 'lien', 'subject_nom': 'Programmation Web'},
        {'titre': 'Schémas réseaux', 'type': 'image', 'subject_nom': 'Réseaux'},
    ]

    count = 0
    for data in ressources_data:
        matiere = matieres.get(data['subject_nom'])
        if not matiere:
            print_warning(f"Matière non trouvée: {data['subject_nom']}")
            continue

        # Générer des URLs fictives
        if data['type'] == 'lien':
            url = f"https://www.exemple.com/{data['titre'].lower().replace(' ', '-')}"
        else:
            url = f"/media/ressources/{data['titre'].lower().replace(' ', '_')}.{data['type']}"

        ressource, created = Ressource.objects.get_or_create(
            titre=data['titre'],
            defaults={
                'description': f"Description de {data['titre']}",
                'Type_ressource': data['type'],
                'fichier_url': url,
                'matiere': matiere,
                'cree_par_admin': admin,
            }
        )
        if created:
            print_success(f"Ressource créée: {ressource.titre} ({ressource.Type_ressource})")
            count += 1

    if count == 0:
        print_info("Toutes les ressources existent déjà")
    return count


# ============================================
# 7. CRÉATION DES NOTES
# ============================================
def create_notes():
    """Crée des notes pour les étudiants"""
    print_header("CRÉATION DES NOTES")

    # Récupérer les étudiants et matières
    etudiants = Etudiant.objects.all()
    matieres = Matiere.objects.all()
    admin = Administrateur.objects.first()

    if not etudiants or not matieres:
        print_warning("Étudiants ou matières manquants")
        return 0

    types_evaluation = ['devoir', 'examen', 'tp', 'projet']
    count = 0

    for etudiant in etudiants:
        for matiere in random.sample(list(matieres), min(5, len(matieres))):
            # Entre 1 et 3 notes par matière
            for _ in range(random.randint(1, 3)):
                type_eval = random.choice(types_evaluation)
                # Distribution des notes plus réaliste
                if random.random() < 0.3:  # 30% de mauvaises notes
                    valeur = round(random.uniform(4, 9.9), 2)
                elif random.random() < 0.5:  # 20% de notes moyennes
                    valeur = round(random.uniform(10, 11.9), 2)
                else:  # 50% de bonnes notes
                    valeur = round(random.uniform(12, 18.5), 2)

                date_note = date.today() - timedelta(days=random.randint(1, 180))

                note, created = Note.objects.get_or_create(
                    student=etudiant,
                    matiere=matiere,
                    type_evaluation=type_eval,
                    date_note=date_note,
                    defaults={
                        'valeur_note': valeur,
                        'valide': random.choice([True, False]),
                        'admin': admin,
                    }
                )
                if created:
                    count += 1

    print_success(f"{count} notes créées au total")
    return count


# ============================================
# 8. CRÉATION DES SUGGESTIONS IA
# ============================================
def create_suggestions():
    """Crée des suggestions d'exercices pour les étudiants"""
    print_header("CRÉATION DES SUGGESTIONS IA")

    etudiants = Etudiant.objects.all()
    exercices = BanqueExercices.objects.all()

    if not etudiants or not exercices:
        print_warning("Étudiants ou exercices manquants")
        return 0

    count = 0
    for etudiant in etudiants[:5]:  # Pour les 5 premiers étudiants
        for _ in range(random.randint(2, 4)):
            exercice = random.choice(exercices)
            note_actuelle = round(random.uniform(5, 15), 2)

            raison = f"Exercice recommandé basé sur tes performances en {exercice.subject.nom_matière}."
            if note_actuelle < 10:
                raison = f"⚠️ Ta moyenne en {exercice.subject.nom_matière} est de {note_actuelle}/20. Cet exercice t'aidera à progresser."
            elif note_actuelle < 12:
                raison = f"📚 Pour consolider tes acquis en {exercice.subject.nom_matière}, voici un exercice adapté."
            else:
                raison = f"🌟 Tu es fort en {exercice.subject.nom_matière} ! Voici un exercice pour te challenger."

            suggestion, created = SuggestionExercice.objects.get_or_create(
                etudiant=etudiant,
                exercice=exercice,
                defaults={
                    'note_actuelle': note_actuelle,
                    'raison': raison,
                    'niveau_suggere': exercice.niveau_difficulte,
                    'date_suggestion': timezone.now() - timedelta(days=random.randint(1, 30)),
                    'est_consultee': random.choice([True, False]),
                    'est_faite': random.choice([True, False]),
                    'matiere': exercice.subject,
                }
            )
            if created:
                count += 1

    print_success(f"{count} suggestions IA créées")
    return count


# ============================================
# 9. CRÉATION DES ÉVÉNEMENTS
# ============================================
def create_events():
    """Crée des événements de calendrier"""
    print_header("CRÉATION DES ÉVÉNEMENTS")

    users = User.objects.all()
    types_event = ['cours', 'examen', 'reunion', 'tp', 'soutenance', 'conférence']
    couleurs = ['blue', 'green', 'red', 'purple', 'orange', 'yellow']

    count = 0

    for user in users[:10]:  # Pour 10 utilisateurs
        for _ in range(random.randint(3, 8)):
            event_type = random.choice(types_event)
            date_event = timezone.now() + timedelta(days=random.randint(-15, 30))
            end_date = date_event + timedelta(hours=random.randint(1, 3))

            event, created = Event.objects.get_or_create(
                user=user,
                title=f"{event_type.capitalize()} - {date_event.strftime('%d/%m')}",
                date=date_event,
                defaults={
                    'type': event_type,
                    'end_date': end_date,
                    'location': random.choice(['Salle 101', 'Amphi A', 'Salle TP 3', 'En ligne', 'Bibliothèque']),
                    'professor': random.choice(['Prof. Martin', 'Dr. Dubois', 'Mme. Bernard', 'M. Petit']),
                    'description': f"Description de l'événement {event_type}",
                    'color': random.choice(couleurs),
                }
            )
            if created:
                count += 1

    print_success(f"{count} événements créés")
    return count


# ============================================
# 10. CRÉATION DES NOTIFICATIONS
# ============================================
def create_notifications():
    """Crée des notifications pour les utilisateurs"""
    print_header("CRÉATION DES NOTIFICATIONS")

    users = User.objects.all()
    types_notif = ['info', 'success', 'warning', 'error']

    titres = [
        'Nouveau cours disponible',
        'Exercice à rendre',
        'Note publiée',
        'Message reçu',
        'Rappel de réunion',
        'Mise à jour système',
        'Félicitations !',
        'Document partagé',
    ]

    count = 0

    for user in users[:10]:  # Pour 10 utilisateurs
        for _ in range(random.randint(2, 5)):
            notification, created = Notification.objects.get_or_create(
                destinataire=user,
                titre=random.choice(titres),
                date_creation=timezone.now() - timedelta(days=random.randint(1, 30)),
                defaults={
                    'type': random.choice(types_notif),
                    'message': f"Ceci est un message de notification pour {user.username}",
                    'est_lu': random.choice([True, False]),
                    'est_envoye': True,
                }
            )
            if created:
                count += 1

    print_success(f"{count} notifications créées")
    return count


# ============================================
# 11. CRÉATION DES LOGS
# ============================================
def create_logs():
    """Crée des logs système"""
    print_header("CRÉATION DES LOGS")

    users = User.objects.all()
    niveaux = ['info', 'success', 'warning', 'error', 'debug']
    types_log = ['auth', 'user', 'system', 'data', 'api', 'security']

    messages = [
        'Connexion utilisateur',
        'Déconnexion',
        'Tentative de connexion échouée',
        'Création de ressource',
        'Modification de note',
        'Accès administrateur',
        'Export de données',
        'Synchronisation effectuée',
        'Erreur de base de données',
        'API appelée avec succès',
    ]

    count = 0

    for _ in range(30):
        log, created = Log.objects.get_or_create(
            level=random.choice(niveaux),
            type=random.choice(types_log),
            message=random.choice(messages),
            created_at=timezone.now() - timedelta(days=random.randint(1, 30)),
            defaults={
                'user': random.choice(users) if random.random() > 0.3 else None,
                'ip_address': f"{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}.{random.randint(1, 255)}",
                'user_agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
                'path': random.choice(['/api/auth/login/', '/api/notes/', '/admin/', '/api/exercices/']),
                'method': random.choice(['GET', 'POST', 'PUT', 'DELETE']),
                'status_code': random.choice([200, 201, 400, 401, 403, 404, 500]),
            }
        )
        if created:
            count += 1

    print_success(f"{count} logs créés")
    return count


# ============================================
# 12. CRÉATION DES STATISTIQUES D'APPRENTISSAGE
# ============================================
def create_stats_apprentissage():
    """Crée des statistiques d'apprentissage pour les étudiants"""
    print_header("CRÉATION DES STATISTIQUES D'APPRENTISSAGE")

    etudiants = Etudiant.objects.all()
    matieres = Matiere.objects.all()

    count = 0

    for etudiant in etudiants:
        for matiere in matieres:
            if random.random() > 0.3:  # 70% des combinaisons
                nb_exos = random.randint(5, 30)
                nb_reussis = random.randint(0, nb_exos)
                taux = (nb_reussis / nb_exos) * 100
                moyenne = round(random.uniform(5, 18), 2)

                stat, created = StatistiqueApprentissage.objects.get_or_create(
                    etudiant=etudiant,
                    matiere=matiere,
                    defaults={
                        'moyenne': moyenne,
                        'exercices_realises': nb_exos,
                        'exercices_reussis': nb_reussis,
                        'taux_reussite': taux,
                        'date_mise_a_jour': timezone.now() - timedelta(days=random.randint(1, 30)),
                    }
                )
                if created:
                    count += 1

    print_success(f"{count} statistiques d'apprentissage créées")
    return count


# ============================================
# MAIN
# ============================================
def main():
    """Fonction principale"""
    print_header("PEUPLEMENT DE LA BASE DE DONNÉES ACADEMIC TWINS")
    print("Début du script...\n")

    # Créer les données dans l'ordre
    users_created = create_users()
    classes_created = create_classes()
    matieres_created = create_matieres()
    admins_created = create_administrateurs()
    exercices_created = create_exercices()
    ressources_created = create_ressources()
    notes_created = create_notes()
    suggestions_created = create_suggestions()
    events_created = create_events()
    notifs_created = create_notifications()
    logs_created = create_logs()
    stats_created = create_stats_apprentissage()

    # Résumé
    print_header("RÉSUMÉ")
    print(f"👥 Utilisateurs créés: {users_created}")
    print(f"🏫 Classes créées: {classes_created}")
    print(f"📚 Matières créées: {matieres_created}")
    print(f"👑 Admins créés: {admins_created}")
    print(f"📝 Exercices créés: {exercices_created}")
    print(f"📁 Ressources créées: {ressources_created}")
    print(f"📊 Notes créées: {notes_created}")
    print(f"🤖 Suggestions IA créées: {suggestions_created}")
    print(f"📅 Événements créés: {events_created}")
    print(f"🔔 Notifications créées: {notifs_created}")
    print(f"📋 Logs créés: {logs_created}")
    print(f"📈 Stats apprentissage créées: {stats_created}")

    print_header("TERMINÉ")
    print("Le peuplement de la base de données est terminé !")


if __name__ == "__main__":
    main()