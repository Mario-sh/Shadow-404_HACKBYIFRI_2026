from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password2', 'role',
                  'filiere', 'niveau', 'numero_etudiant', 'telephone']

    def validate(self, data):
        if data['password'] != data['password2']:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas")
        return data

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get('username')
        password = data.get('password')

        if username and password:
            user = authenticate(username=username, password=password)

            if user:
                if not user.is_active:
                    raise serializers.ValidationError("Compte désactivé")

                refresh = RefreshToken.for_user(user)

                return {
                    'user': user,
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                }
            else:
                raise serializers.ValidationError("Identifiants incorrects")
        else:
            raise serializers.ValidationError("Username et password requis")


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'filiere',
                  'niveau', 'numero_etudiant', 'telephone', 'last_login', 'date_joined']
        read_only_fields = ['id', 'last_login', 'date_joined']


class UserUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['email', 'filiere', 'niveau', 'numero_etudiant', 'telephone']