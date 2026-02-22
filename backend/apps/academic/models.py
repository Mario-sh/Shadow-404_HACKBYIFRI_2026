from django.db import models


class Administrateur(models.Model):
    id_admin = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.CharField(max_length=150, unique=True)
    mot_de_passe = models.CharField(max_length=255)  # À hasher en production
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'administrateur'
        managed = False

    def __str__(self):
        return f"{self.prenom} {self.nom} (Admin)"


class Classe(models.Model):
    id_classe = models.AutoField(primary_key=True)
    nom_class = models.CharField(max_length=100)
    niveau = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'classe'
        managed = False

    def __str__(self):
        return f"{self.nom_class} - {self.niveau}"


class Professeur(models.Model):
    id_professeur = models.AutoField(primary_key=True)
    nom_prof = models.CharField(max_length=100)
    prenom_prof = models.CharField(max_length=100)
    email = models.CharField(max_length=150, unique=True)
    specialite = models.CharField(max_length=100, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'professeur'
        managed = False

    def __str__(self):
        return f"Pr. {self.prenom_prof} {self.nom_prof}"


class Etudiant(models.Model):
    id_student = models.AutoField(primary_key=True)
    matricule = models.CharField(max_length=100, unique=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    email = models.CharField(max_length=150, unique=True)
    date_inscription = models.DateField()
    classe = models.ForeignKey(Classe, on_delete=models.CASCADE, db_column='classe_id')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'etudiant'
        managed = False

    def __str__(self):
        return f"{self.matricule} - {self.prenom} {self.nom}"


class Matiere(models.Model):
    id_matiere = models.AutoField(primary_key=True)
    nom_matière = models.CharField(max_length=100)  # Note l'accent !
    coefficient = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'matiere'
        managed = False

    def __str__(self):
        return self.nom_matière


class BanqueExercices(models.Model):
    DIFFICULTE_CHOICES = [
        (1, 'Facile'),
        (2, 'Moyen'),
        (3, 'Difficile'),
    ]

    id_exercice = models.AutoField(primary_key=True)
    subject = models.ForeignKey(Matiere, on_delete=models.CASCADE, db_column='subject_id')
    titre = models.CharField(max_length=255)
    niveau_difficulte = models.IntegerField(choices=DIFFICULTE_CHOICES)
    fichier_url = models.TextField()
    cree_par = models.ForeignKey(Professeur, on_delete=models.CASCADE, db_column='cree_par')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'banque_exercices'
        managed = False

    def __str__(self):
        return f"{self.titre} (Niv. {self.niveau_difficulte})"


class Note(models.Model):
    TYPE_EVAL_CHOICES = [
        ('devoir', 'Devoir'),
        ('examen', 'Examen'),
        ('tp', 'Travaux Pratiques'),
    ]

    id_note = models.AutoField(primary_key=True)
    student = models.ForeignKey(Etudiant, on_delete=models.CASCADE, db_column='id_student')
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, db_column='id_matiere')
    admin = models.ForeignKey(Administrateur, on_delete=models.CASCADE, db_column='id_admin')
    type_evaluation = models.CharField(max_length=10, choices=TYPE_EVAL_CHOICES)
    valeur_note = models.DecimalField(max_digits=5, decimal_places=2)  # Note sur 20
    date_note = models.DateField()
    valide = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'note'
        managed = False
        unique_together = ['student', 'matiere', 'type_evaluation', 'date_note']
        constraints = [
            models.CheckConstraint(
                check=models.Q(valeur_note__gte=0, valeur_note__lte=20),
                name='note_valeur_range'
            )
        ]

    def __str__(self):
        return f"{self.student} - {self.matiere} - {self.valeur_note}/20"


class Ressource(models.Model):
    TYPE_RESSOURCE_CHOICES = [
        ('pdf', 'PDF'),
        ('video', 'Vidéo'),
        ('lien', 'Lien web'),
        ('document', 'Document'),
    ]

    id_ressource = models.AutoField(primary_key=True)
    matiere = models.ForeignKey(Matiere, on_delete=models.CASCADE, db_column='id_matiere')
    titre = models.CharField(max_length=255)
    description = models.TextField(null=True, blank=True)
    Type_ressource = models.CharField(max_length=10, choices=TYPE_RESSOURCE_CHOICES)
    fichier_url = models.TextField()
    cree_par_admin = models.ForeignKey(Administrateur, on_delete=models.CASCADE, db_column='cree_par_admin')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'ressource'
        managed = False
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.titre} ({self.Type_ressource})"