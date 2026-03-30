# Page Projets — Design Spec

**Date:** 2026-03-28

## Objectif

Créer une page `/projets` qui affiche tous les projets issus de Sanity CMS, avec scroll vertical et animation d'entrée FallIn par card.

## Route

`src/app/projets/page.tsx`

## Données

**Source :** Sanity CMS (client existant dans `src/lib/sanity.ts`)

**Schéma Sanity (`project`) :**
| Champ  | Type   | Description                  |
|--------|--------|------------------------------|
| title  | string | Nom du projet                |
| slug   | slug   | Identifiant URL              |
| image  | image  | Visuel principal             |
| color  | string | Couleur de fond de la card   |

**Query GROQ :**
```groq
*[_type == "project"] | order(_createdAt asc) {
  title,
  "image": image.asset->url,
  color
}
```

**Revalidation :** `export const revalidate = 60`

## Layout

- Page avec scroll vertical natif (pas de `HorizontalScroll`)
- Conteneur : `flex flex-wrap justify-start gap-12 px-16 py-20`
- Chaque card : `w-[380px] shrink-0`
- Chaque card wrappée dans `FallIn` avec `delay={i * 0.05}`

## Composants réutilisés

- `Card` — inchangé
- `FallIn` — inchangé

## Fichiers à créer

- `src/app/projets/page.tsx`

## Fichiers à ne pas modifier

- `Card.tsx`, `FallIn.tsx`, `HorizontalScroll.tsx`, `page.tsx` (home)
