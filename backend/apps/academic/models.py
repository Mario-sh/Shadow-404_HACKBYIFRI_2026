from django.db import models
from apps.accounts.models import User


class Classe(models.Model):
    id_classe = models.AutoField(primary_key=True)
    nom_class = models.CharField(max_length=100)
    niveau = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'classe'

    def __str__(self):
        return self.nom_class


class Matiere(models.Model):
    id_matiere = models.AutoField(primary_key=True)
    nom_matière = models.CharField(max_length=100)
    coefficient = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'matiere'

    def __str__(self):
        return self.nom_matière


class Professeur(models.Model):
    id_professeur = models.AutoField(primary_key=True)
    nom_prof = models.CharField(max_length=100)
    prenom_prof = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    specialite = models.CharField(max_length=100, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'professeur'

    def __str__(self):
        return f"{self.prenom_prof} {self.nom_prof}"


class Administrateur(models.Model):
    id_admin = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    mot_de_passe = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'administrateur'

    def __str__(self):
        return f"{self.prenom} {self.nom}"


class Etudiant(models.Model):
    id_student = models.AutoField(primary_key=True)
    matricule = models.CharField(max_length=100, unique=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    date_inscription = models.DateField()
    classe = models.ForeignKey(
        Classe,
        on_delete=models.CASCADE,
        db_column='classe_id',
        null=True,      # ← Permettre NULL
        blank=True      # ← Permettre vide
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        db_column='user_id'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'etudiant'

    def __str__(self):
        return f"{self.prenom} {self.nom} ({self.matricule})"


class Note(models.Model):
    TYPE_EVALUATION = (
        ('devoir', 'Devoir'),
        ('examen', 'Examen'),
        ('tp', 'Travaux Pratiques'),
    )

    id_note = models.AutoField(primary_key=True)
    student = models.ForeignKey(
        Etudiant,
        on_delete=models.CASCADE,
        db_column='id_student'
    )
    matiere = models.ForeignKey(
        Matiere,
        on_delete=models.CASCADE,
        db_column='id_matiere'
    )
    admin = models.ForeignKey(
        Administrateur,
        on_delete=models.CASCADE,
        db_column='id_admin'
    )
    type_evaluation = models.CharField(max_length=20, choices=TYPE_EVALUATION)
    valeur_note = models.DecimalField(max_digits=5, decimal_places=2)
    date_note = models.DateField()
    valide = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'note'
        unique_together = ['student', 'matiere', 'type_evaluation', 'date_note']

    def __str__(self):
        return f"{self.student} - {self.matiere}: {self.valeur_note}/20"


class BanqueExercices(models.Model):
    NIVEAUX_DIFFICULTE = (
        (1, 'Facile'),
        (2, 'Moyen'),
        (3, 'Difficile'),
    )

    id_exercice = models.AutoField(primary_key=True)
    subject = models.ForeignKey(
        Matiere,
        on_delete=models.CASCADE,
        db_column='subject_id'
    )
    titre = models.CharField(max_length=255)
    niveau_difficulte = models.IntegerField(choices=NIVEAUX_DIFFICULTE)
    fichier_url = models.TextField()
    cree_par = models.ForeignKey(
        Professeur,
        on_delete=models.CASCADE,
        db_column='cree_par'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'banque_exercices'

    def __str__(self):
        return self.titre


class Ressource(models.Model):
    TYPE_RESSOURCE = (
        ('pdf', 'PDF'),
        ('video', 'Vidéo'),
        ('lien', 'Lien'),
        ('document', 'Document'),
    )

    id_ressource = models.AutoField(primary_key=True)
    matiere = models.ForeignKey(
        Matiere,
        on_delete=models.CASCADE,
        db_column='id_matiere'
    )
    titre = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    Type_ressource = models.CharField(max_length=20, choices=TYPE_RESSOURCE)
    fichier_url = models.TextField()
    cree_par_admin = models.ForeignKey(
        Administrateur,
        on_delete=models.CASCADE,
        db_column='cree_par_admin'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ressource'

    def __str__(self):
        return self.titre