# ComptaDZ – Backend API

Ce dossier contient le code backend du SaaS ComptaDZ, basé sur Node.js, TypeScript, Express et PostgreSQL (multi-schémas).

## Structure recommandée

```
/api
│
├── src
│   ├── config           # Configuration (env, DB, ORM...)
│   ├── middlewares      # Middlewares Express (auth, multi-tenant...)
│   ├── models           # Modèles ORM (utilisateur, facture, écriture...)
│   ├── routes           # Routes Express (auth, factures, users...)
│   ├── services         # Logique métier (auth, factures, OCR...)
│   ├── utils            # Fonctions utilitaires
│   └── index.ts         # Entrée principale de l’API
│
├── migrations           # Scripts de migration DB multi-schémas
├── tests                # Tests unitaires et d’intégration
├── package.json         # Dépendances Node.js
├── tsconfig.json        # Config TypeScript
└── .env.example         # Variables d’environnement (exemple)
```

## Points clés
- Gestion multi-tenant par schéma PostgreSQL
- Authentification JWT
- ORM compatible multi-schémas (ex: Prisma, Sequelize)
- Séparation claire logique métier / routes / modèles
- Scripts de migration pour chaque schéma

Prêt pour l’initialisation du code !
