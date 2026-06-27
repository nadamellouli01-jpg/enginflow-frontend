# 💻 EnginFlow - Frontend

## 📖 Description

Ce dépôt contient le **frontend** de l'application **EnginFlow**, développé avec **React**.

L'interface utilisateur permet aux demandeurs et aux administrateurs de gérer l'ensemble du processus d'affectation des engins industriels à travers une application moderne, ergonomique et responsive.

Le frontend communique avec le backend via une **API REST**.

---

# ✨ Fonctionnalités

## Demandeur

* Connexion
* Inscription
* Création d'une demande
* Téléversement des pièces jointes
* Suivi des demandes
* Notifications
* Consultation du profil
* Modification du mot de passe

---

## Administrateur

* Tableau de bord
* Consultation des demandes
* Recherche multicritères
* Validation
* Refus
* Modification
* Consultation de l'historique

---

# 🖥️ Architecture

```
Utilisateur
      │
      ▼
React Components
      │
      ▼
Axios
      │
      ▼
REST API (Spring Boot)
```

Organisation du projet :

```
src/

├── api/
├── components/
│   ├── Admin/
│   ├── Auth/
│   ├── Common/
│   └── Demandeur/
├── context/
├── App.js
└── index.js
```

---

# 🛠️ Technologies

* React
* Axios
* React Router
* Tailwind CSS

---

# 🚀 Installation

### Cloner le projet

```bash
git clone <URL_DU_DEPOT_FRONTEND>
```

### Installer les dépendances

```bash
npm install
```

### Démarrer l'application

```bash
npm start
```

L'application est disponible à l'adresse :

```
http://localhost:3000
```

---

# 🔗 Dépôt Backend

Le backend du projet est disponible ici :

**👉 https://github.com/nadamellouli01-jpg/enginflow-backend**

---

# 📸 Fonctionnalités principales

L'application permet :

* l'authentification des utilisateurs ;
* la création des demandes d'engins ;
* le suivi des demandes ;
* la gestion des notifications ;
* la consultation des tableaux de bord ;
* la validation et la gestion des demandes par l'administrateur.

---

# 👩‍💻 Auteur

**Nada MELLOULI**

Étudiante à l'École Supérieure de Technologie de Salé

Stage d'initiation – Digital Manufacturing – OCP Jorf Lasfar
