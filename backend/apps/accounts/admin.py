from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'filiere', 'niveau', 'numero_etudiant')
    list_filter = ('role', 'filiere', 'niveau')
    search_fields = ('username', 'email', 'numero_etudiant')
    
    fieldsets = UserAdmin.fieldsets + (
        ('Informations IFRI', {
            'fields': ('role', 'filiere', 'niveau', 'numero_etudiant', 'telephone'),
        }),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Informations IFRI', {
            'fields': ('role', 'filiere', 'niveau', 'numero_etudiant', 'telephone'),
        }),
    )