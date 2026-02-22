from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from .models import Classe, Etudiant, Matiere, Note

User = get_user_model()


class AcademicAPITestCase(TestCase):
    def setUp(self):
        """Configuration initiale pour les tests"""
        self.client = APIClient()

        # Créer un utilisateur de test
        self.user = User.objects.create_user(
            username='testuser',
            password='testpass123',
            role='admin'
        )
        self.client.force_authenticate(user=self.user)

        # Créer des données de test
        self.classe = Classe.objects.create(
            nom_class='L1 INFO',
            niveau='Licence 1'
        )

        self.etudiant = Etudiant.objects.create(
            matricule='2024001',
            nom='Dupont',
            prenom='Jean',
            email='jean.dupont@test.com',
            date_inscription='2024-09-01',
            classe=self.classe
        )

    def test_get_classes(self):
        """Test de récupération des classes"""
        response = self.client.get('/api/academic/classes/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_get_etudiants(self):
        """Test de récupération des étudiants"""
        response = self.client.get('/api/academic/etudiants/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_create_etudiant(self):
        """Test de création d'un étudiant"""
        data = {
            'matricule': '2024002',
            'nom': 'Martin',
            'prenom': 'Sophie',
            'email': 'sophie.martin@test.com',
            'date_inscription': '2024-09-01',
            'classe': self.classe.id_classe
        }
        response = self.client.post('/api/academic/etudiants/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_etudiant_statistiques(self):
        """Test des statistiques étudiant"""
        response = self.client.get(f'/api/academic/etudiants/{self.etudiant.id_student}/statistiques/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)