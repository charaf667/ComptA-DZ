# Guide Complet IFRS - SaaS Comptabilité PME Algériennes

## Résumé Exécutif

Les **7 classes IFRS** organisent tous les comptes d'une entreprise selon leur nature économique. Chaque transaction génère des **écritures comptables** qui affectent au minimum 2 comptes (principe de la partie double). Votre moteur de suggestion analysera les documents pour proposer automatiquement les comptes IFRS appropriés.

### Principe de base
```
Document importé → Analyse (OCR/IA) → Suggestion classe/compte → Validation → Écriture comptable
```

## Tableau des 7 Classes IFRS

| Classe | Libellé | Nature | Exemples de comptes | Cas d'usage typiques |
|--------|---------|--------|-------------------|-------------------|
| **1** | **Capitaux propres** | Ressources internes | 101-Capital social<br>106-Réserves<br>120-Résultat | Constitution société<br>Distribution dividendes<br>Affectation résultats |
| **2** | **Immobilisations** | Actifs durables | 211-Terrains<br>213-Constructions<br>218-Matériel informatique<br>281-Amortissements | Achat équipements<br>Investissements<br>Amortissements |
| **3** | **Stocks** | Biens stockés | 301-Matières premières<br>355-Produits finis<br>371-Marchandises | Achats pour revente<br>Production<br>Inventaires |
| **4** | **Tiers** | Créances/Dettes | 401-Fournisseurs<br>411-Clients<br>445-TVA<br>421-Personnel | Ventes clients<br>Achats fournisseurs<br>Salaires |
| **5** | **Financiers** | Trésorerie | 512-Banques<br>530-Caisse<br>164-Emprunts | Encaissements<br>Décaissements<br>Emprunts |
| **6** | **Charges** | Coûts/Dépenses | 601-Achats<br>613-Électricité<br>641-Salaires<br>681-Amortissements | Factures fournisseurs<br>Services<br>Salaires |
| **7** | **Produits** | Revenus | 701-Ventes<br>706-Prestations<br>765-Produits financiers | Ventes clients<br>Services rendus |

## Structure Base de Données PostgreSQL

### Schéma simplifié optimisé

```sql
-- =============================================
-- 1. TABLE PLAN COMPTABLE IFRS
-- =============================================
CREATE TABLE comptes_ifrs (
    id SERIAL PRIMARY KEY,
    code_compte VARCHAR(10) NOT NULL UNIQUE,
    libelle VARCHAR(255) NOT NULL,
    classe INTEGER NOT NULL CHECK (classe BETWEEN 1 AND 7),
    nature ENUM('debit', 'credit') NOT NULL,
    type_compte ENUM('detail', 'collectif') DEFAULT 'detail',
    compte_parent VARCHAR(10) REFERENCES comptes_ifrs(code_compte),
    actif BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Index pour performance
    INDEX idx_classe (classe),
    INDEX idx_code (code_compte),
    INDEX idx_parent (compte_parent)
);

-- =============================================
-- 2. TABLE ÉCRITURES COMPTABLES
-- =============================================
CREATE TABLE ecritures (
    id SERIAL PRIMARY KEY,
    numero_piece VARCHAR(50) NOT NULL,
    date_piece DATE NOT NULL,
    date_saisie TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    libelle TEXT NOT NULL,
    montant_total DECIMAL(15,2) NOT NULL,
    devise VARCHAR(3) DEFAULT 'DZD',
    statut ENUM('brouillon', 'valide', 'lettre') DEFAULT 'brouillon',
    type_piece ENUM('vente', 'achat', 'banque', 'caisse', 'od') NOT NULL,
    document_source VARCHAR(255), -- Lien vers PDF/image
    user_id INTEGER NOT NULL,
    company_id INTEGER NOT NULL,
    
    -- Validation métier
    CONSTRAINT chk_montant_positif CHECK (montant_total > 0),
    INDEX idx_date_piece (date_piece),
    INDEX idx_company (company_id),
    INDEX idx_statut (statut)
);

-- =============================================
-- 3. TABLE LIGNES D'ÉCRITURES (Débit/Crédit)
-- =============================================
CREATE TABLE lignes_ecritures (
    id SERIAL PRIMARY KEY,
    ecriture_id INTEGER NOT NULL REFERENCES ecritures(id) ON DELETE CASCADE,
    compte_code VARCHAR(10) NOT NULL REFERENCES comptes_ifrs(code_compte),
    libelle VARCHAR(255) NOT NULL,
    montant_debit DECIMAL(15,2) DEFAULT 0,
    montant_credit DECIMAL(15,2) DEFAULT 0,
    lettrage VARCHAR(20), -- Pour rapprochements
    
    -- Validation partie double
    CONSTRAINT chk_debit_ou_credit CHECK (
        (montant_debit > 0 AND montant_credit = 0) OR 
        (montant_credit > 0 AND montant_debit = 0)
    ),
    INDEX idx_ecriture (ecriture_id),
    INDEX idx_compte (compte_code)
);

-- =============================================
-- 4. TABLE SUGGESTIONS IA (Moteur apprentissage)
-- =============================================
CREATE TABLE suggestions_ia (
    id SERIAL PRIMARY KEY,
    company_id INTEGER NOT NULL,
    libelle_document TEXT NOT NULL,
    montant DECIMAL(15,2),
    type_document VARCHAR(50), -- 'facture', 'recu', 'releve'
    compte_suggere VARCHAR(10) REFERENCES comptes_ifrs(code_compte),
    classe_suggeree INTEGER,
    score_confiance DECIMAL(3,2), -- 0.00 à 1.00
    validation_user BOOLEAN, -- true si validé par utilisateur
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_company_type (company_id, type_document),
    INDEX idx_confiance (score_confiance DESC)
);

-- =============================================
-- 5. TRIGGERS VALIDATION AUTOMATIQUE
-- =============================================

-- Trigger validation équilibre débit/crédit
CREATE OR REPLACE FUNCTION validate_balance_ecriture()
RETURNS TRIGGER AS $
DECLARE
    total_debit DECIMAL(15,2);
    total_credit DECIMAL(15,2);
BEGIN
    -- Calculer totaux débit/crédit pour cette écriture
    SELECT 
        COALESCE(SUM(montant_debit), 0),
        COALESCE(SUM(montant_credit), 0)
    INTO total_debit, total_credit
    FROM lignes_ecritures 
    WHERE ecriture_id = COALESCE(NEW.ecriture_id, OLD.ecriture_id);
    
    -- Vérifier équilibre (tolérance 0.01 pour arrondis)
    IF ABS(total_debit - total_credit) > 0.01 THEN
        RAISE EXCEPTION 'Écriture déséquilibrée: Débit=% Crédit=%', total_debit, total_credit;
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_balance
    AFTER INSERT OR UPDATE OR DELETE ON lignes_ecritures
    FOR EACH ROW EXECUTE FUNCTION validate_balance_ecriture();
```

## 🤖 Moteur de Suggestion - Architecture

### 1. Approche Rule-Based (Simple et efficace)

```sql
-- Table règles de mapping
CREATE TABLE regles_suggestion (
    id SERIAL PRIMARY KEY,
    mot_cle VARCHAR(100) NOT NULL,
    compte_cible VARCHAR(10) REFERENCES comptes_ifrs(code_compte),
    priorite INTEGER DEFAULT 1,
    type_document VARCHAR(50),
    actif BOOLEAN DEFAULT true
);

-- Données d'exemple
INSERT INTO regles_suggestion (mot_cle, compte_cible, priorite, type_document) VALUES
('sonelgaz', '6061', 1, 'facture'),        -- Électricité
('algerie telecom', '6262', 1, 'facture'), -- Téléphone
('carburant', '6022', 1, 'facture'),       -- Essence
('salaire', '6411', 1, 'bulletin'),       -- Salaires
('loyer', '6132', 1, 'facture'),          -- Locations
('vente', '7011', 1, 'facture');          -- Ventes
```

### 2. Fonction de Suggestion Automatique

```sql
CREATE OR REPLACE FUNCTION suggerer_compte(
    p_libelle TEXT,
    p_montant DECIMAL DEFAULT NULL,
    p_type_document VARCHAR DEFAULT 'facture'
) RETURNS TABLE (
    compte_code VARCHAR(10),
    libelle_compte VARCHAR(255),
    score_confiance DECIMAL(3,2),
    justification TEXT
) AS $
BEGIN
    RETURN QUERY
    SELECT 
        c.code_compte,
        c.libelle,
        CASE 
            WHEN r.priorite = 1 THEN 0.95
            WHEN r.priorite = 2 THEN 0.80
            ELSE 0.60
        END as score_confiance,
        'Correspondance mot-clé: ' || r.mot_cle as justification
    FROM regles_suggestion r
    JOIN comptes_ifrs c ON r.compte_cible = c.code_compte
    WHERE 
        r.actif = true
        AND r.type_document = p_type_document
        AND LOWER(p_libelle) LIKE '%' || LOWER(r.mot_cle) || '%'
    ORDER BY r.priorite ASC, score_confiance DESC
    LIMIT 3;
END;
$ LANGUAGE plpgsql;
```

## 💡 Exemples d'Usage Pratiques

### Cas 1: Facture Électricité SONELGAZ
```sql
-- Document scanné: "Facture SONELGAZ Électricité - 15,000 DA"
SELECT * FROM suggerer_compte('Facture SONELGAZ Électricité', 15000, 'facture');

-- Résultat suggéré:
-- Compte: 6061 (Électricité) - Confiance: 95%
-- Écriture générée:
-- Débit 6061 - Électricité: 15,000 DA
-- Crédit 401 - Fournisseurs: 15,000 DA
```

### Cas 2: Vente Client
```sql
-- Document: "Facture vente client ABC - 50,000 DA HT + 9,000 TVA"
SELECT * FROM suggerer_compte('Facture vente client ABC', 50000, 'facture');

-- Écriture générée:
-- Débit 411 - Clients: 59,000 DA
-- Crédit 7011 - Ventes: 50,000 DA  
-- Crédit 4457 - TVA collectée: 9,000 DA
```

## 🚀 Plan d'Implémentation Progressive

### Phase 1: Fondations (Semaine 1-2)
1. **Créer structure BDD** avec plan comptable IFRS
2. **Seeder les comptes** standard algériens
3. **API basique** CRUD comptes et écritures

### Phase 2: Moteur Simple (Semaine 3-4)  
1. **Règles manuelles** pour cas fréquents
2. **Fonction suggestion** basique
3. **Interface validation** utilisateur

### Phase 3: Apprentissage (Semaine 5-6)
1. **Collecte feedbacks** utilisateur
2. **Amélioration règles** basée sur l'usage
3. **Score confiance** dynamique

### Phase 4: IA Avancée (Semaine 7-8)
1. **Machine Learning** pour patterns complexes
2. **Classification automatique** par secteur
3. **Prédiction comptes** multi-critères

## ✅ Points Clés à Retenir

1. **Commencez simple** : règles manuelles avant IA complexe
2. **Validez toujours** : l'équilibre débit/crédit est sacré
3. **Adaptez au contexte** : PME algériennes ont des spécificités
4. **Mesurez la performance** : score de confiance sur suggestions
5. **Apprenez des utilisateurs** : leurs corrections améliorent le système

Cette architecture vous donne une base solide pour un SaaS comptable IFRS performant et évolutif !