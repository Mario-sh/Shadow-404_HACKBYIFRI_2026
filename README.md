<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=2E75B6,1F4E79&height=200&section=header&text=AcademicTwins&fontSize=60&fontColor=ffffff&fontAlignY=38&desc=Plateforme%20intelligente%20de%20suivi%20académique&descAlignY=60&descSize=18" width="100%"/>

<br/>

[![🌐 Demo Live](https://img.shields.io/badge/🌐%20Voir%20la%20Démo-academictwins.vercel.app-2E75B6?style=for-the-badge&labelColor=1F4E79)](https://academictwins.vercel.app/)
&nbsp;
[![⚡ API](https://img.shields.io/badge/⚡%20API%20Backend-En%20ligne-00C851?style=for-the-badge&labelColor=1a6b3a)](https://shadow-404-hackbyifri-2026-iepp.onrender.com)
&nbsp;
[![🎬 Démo vidéo](https://img.shields.io/badge/🎬%20Vidéo%20Démo-Google%20Drive-EA4335?style=for-the-badge&labelColor=7a1a1a)](https://drive.google.com/file/d/1UNWSdpm4J3nbN0Jvv6qXt4kg9RAV2Wk9/view?usp=drivesdk)

<br/>

![HACKBYIFRI 2026](https://img.shields.io/badge/HACKBYIFRI-2026-FFD700?style=flat-square&labelColor=1F4E79)
&nbsp;
![Team](https://img.shields.io/badge/Équipe-Shadow--404-white?style=flat-square&labelColor=1A1A2E)
&nbsp;
![Status](https://img.shields.io/badge/Statut-🟢%20En%20ligne-success?style=flat-square)

<br/>

[![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Django](https://img.shields.io/badge/Django-092E20?style=flat-square&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat-square&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

## 🎯 Le Problème

> *Dans les universités béninoises, les étudiants attendent des **semaines** pour consulter leurs notes. Les enseignants gèrent tout sur Excel. L'administration n'a aucune vue d'ensemble. Résultat : des étudiants en échec qu'on n'a pas vu venir.*

**AcademicTwins** change ça. Tout est centralisé, visible en temps réel, et enrichi par l'IA.

---

## 🚀 Essayer maintenant

<div align="center">

| | Lien | Description |
|:---:|:---|:---|
| 🌐 | **[academictwins.vercel.app](https://academictwins.vercel.app/)** | Application web complète |
| ⚡ | **[API sur Render](https://shadow-404-hackbyifri-2026-iepp.onrender.com)** | Backend Django REST |
| 🎬 | **[Vidéo de démo](https://drive.google.com/file/d/1UNWSdpm4J3nbN0Jvv6qXt4kg9RAV2Wk9/view?usp=drivesdk)** | Présentation du projet |

> 💡 **Comptes de test** — se connecter directement depuis la page de démo avec les identifiants pré-remplis (étudiant, professeur, admin).

</div>

---

## ✨ Fonctionnalités

### 👨‍🎓 Espace Étudiant

L'étudiant dispose d'un **dashboard personnel** affichant sa moyenne générale, son classement dans la classe et sa courbe de progression au fil du semestre. Il peut consulter et télécharger ses relevés de notes en PDF ou CSV, recevoir des **notifications en temps réel** dès qu'une note est publiée, et s'appuyer sur les **recommandations d'exercices générées par l'IA** pour travailler en priorité ses points faibles.

### 👨‍🏫 Espace Enseignant

L'enseignant saisit et valide les notes via un workflow structuré, importe ou exporte ses listes en Excel, et accède à un **tableau de bord analytique** qui identifie automatiquement les étudiants en difficulté. Il peut envoyer des messages ciblés à un étudiant ou à un groupe entier directement depuis la plateforme.

### 🛡️ Espace Administrateur

L'administrateur gère l'intégralité de la plateforme : création des classes, filières, matières et comptes utilisateurs. Il dispose d'une vue consolidée en temps réel sur l'ensemble de l'établissement, ce qui était auparavant impossible avec des tableurs dispersés.

### 🤖 Intelligence Artificielle

Le moteur IA analyse les notes de chaque étudiant, détecte les matières en dessous de la moyenne (< 10/20), calcule un score de priorité basé sur la note et le coefficient, puis génère des **recommandations d'exercices personnalisées**. L'enseignant reçoit une alerte proactive pour chaque étudiant identifié à risque.

---

## 🏗️ Architecture & Installation

AcademicTwins suit une architecture **client-serveur découplée** : un frontend React déployé sur Vercel communique avec un backend Django via REST API et WebSockets, le tout s'appuyant sur une base de données MySQL hébergée séparément.

Pour lancer le projet en local, vous aurez besoin de **Python 3.10+**, **Node.js 18+** et **MySQL 8+**. Clonez le dépôt, importez le schéma SQL fourni (`academic_twinst.sql`), configurez les variables d'environnement dans les deux dossiers `backend/` et `frontend-academic/` à partir des fichiers `.env.example`, puis lancez `python manage.py runserver` et `npm run dev`. Le backend sera disponible sur `localhost:8000` et le frontend sur `localhost:5173`.

```bash
git clone https://github.com/Mario-sh/Shadow-404_HACKBYIFRI_2026.git
```

---

## 📊 Avancement

| Fonctionnalité | État |
|---|:---:|
| Authentification JWT — Admin / Prof / Étudiant |  Terminé |
| Interface Étudiant — dashboard, notes, suggestions IA |  95% |
| Interface Professeur — saisie, stats, alertes |  95% |
| Interface Admin — gestion complète |  Terminé |
| Base de données — schéma + données de test |  Terminé |
| Déploiement Frontend sur Vercel |  Live |
| Déploiement Backend sur Render |  Live |
| Export PDF des bulletins | 🔄 En cours|
| Application mobile React Native |  🔄 En cours |
| Chatbot IA | 🔄 En cours |

---

## 🛠️ Stack technique

| Couche | Technologie | Rôle |
|---|---|---|
| ⚛️ Frontend | React + Vite | UI réactive, HMR ultra-rapide |
| 🎨 Style | Tailwind CSS | Responsive natif, léger en prod |
| 🔄 Data | React Query + Axios | Cache auto, gestion des erreurs |
| 📊 Graphiques | Recharts | Visualisations animées |
| 🐍 Backend | Django + DRF | API REST robuste et sécurisée |
| 🔑 Auth | JWT (SimpleJWT) | Stateless, multi-appareils |
| 🗄️ BDD | MySQL / MariaDB | Performant, fiable |
| 🔴 Temps réel | WebSockets | Notifications bidirectionnelles |
| ☁️ Hébergement | Vercel + Render | CI/CD automatique sur chaque push |

---

## 👥 L'équipe Shadow-404

<div align="center">

| Rôle | Nom | Niveau |
|:---:|---|:---:|
| 👑 Chef de projet | **Dylane Mario LOKOSSOU SOTON** | ESGIS — L2 |
| 💻 Développeur | [**Adéliyi ARIORI O.**](https://github.com/hackadil) | ESGIS — L2 |
| 💻 Développeur | [**Melris ZOHOUN**](https://github.com/Ange20060) | ESGIS — L2 |
| 💻 Développeur | [**Ezechiel HOUNKPE**](https://github.com/ezechielben06) | ESGIS — L2 |
| 💻 Développeur | [**Aniyath SOUNON TAMOU**](https://github.com/Aniyath03) | ESGIS — L1 |

*Filière Architecture Logicielle — ESGIS Bénin*

</div>

---

## 📄 Contexte

Projet réalisé dans le cadre du **HACKBYIFRI 2026**.

> 🏆 Thème : *« Intégration Efficace du Numérique dans l'Apprentissage »*

---

<div align="center">

**[🌐 Démo live](https://academictwins.vercel.app/)** · **[⚡ API](https://shadow-404-hackbyifri-2026-iepp.onrender.com)** · **[🎬 Vidéo](https://drive.google.com/file/d/1UNWSdpm4J3nbN0Jvv6qXt4kg9RAV2Wk9/view?usp=drivesdk)** · **[⭐ Star le repo](https://github.com/Mario-sh/Shadow-404_HACKBYIFRI_2026)**

<br/>

Fait avec ❤️ par **Shadow-404** — ESGIS Bénin | HACKBYIFRI 2026

<img src="https://capsule-render.vercel.app/api?type=waving&color=2E75B6,1F4E79&height=100&section=footer" width="100%"/>

</div>
