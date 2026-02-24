import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from apps.accounts.models import User
from apps.academic.models import Etudiant, Classe
from django.utils import timezone
from datetime import date

print("=== TEST CRÉATION ÉTUDIANT ===")

# 1. Créer un utilisateur
user = User.objects.create_user(
    username='test.user',
    email='test@test.com',
    password='password123',
    role='etudiant',
    filiere='Informatique',
    niveau='L1'
)
print(f"✅ Utilisateur créé: {user.username} (ID: {user.id})")

# 2. Trouver une classe
classe = Classe.objects.filter(niveau__icontains='L1').first()
print(f"📚 Classe trouvée: {classe.nom_class if classe else 'Aucune'}")

# 3. Créer l'étudiant
etudiant = Etudiant.objects.create(
    matricule=f"TEST{user.id}",
    nom='User',
    prenom='Test',
    email=user.email,
    date_inscription=date.today(),
    classe=classe,
    user=user
)
print(f"✅ Étudiant créé: {etudiant.prenom} {etudiant.nom} (ID: {etudiant.id_student})")

print("=== SUCCÈS ===")