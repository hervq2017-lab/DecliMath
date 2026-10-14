# Format d'un avis (docs/validation/avis-prof-maths.json)
```json
{
  "maths:4e:theoreme-de-pythagore": {
    "avis": "recommande-validation | a-corriger | refuse",
    "recalcule": true,
    "problemes": [{"gravite": "bloquant|a-corriger|conseil", "ou": "étape 2", "quoi": "…", "correction": "texte proposé"}],
    "points_forts": ["…"],
    "date": "AAAA-MM-JJ"
  }
}
```
- `recalcule: true` seulement si tu as refait tous les calculs.
- `correction` : texte de remplacement prêt à copier.
- Un avis n'est **jamais** une validation : l'humain valide dans l'écran « Cours à valider ».
