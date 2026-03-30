# Page Projets Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Créer la page `/projets` qui affiche les projets Sanity en flex wrap avec scroll vertical et animation FallIn.

**Architecture:** Async Server Component qui fetch directement depuis le client Sanity existant. Aucun état client, aucun nouveau composant. Revalidation toutes les 60 secondes.

**Tech Stack:** Next.js 16 App Router, Sanity client (`@sanity/client`), GSAP via `FallIn`, Tailwind CSS v4

---

### Task 1 : Créer `src/app/projets/page.tsx`

**Files:**
- Create: `src/app/projets/page.tsx`

- [ ] **Step 1 : Créer le fichier**

```tsx
import { sanity } from "@/lib/sanity";
import Card from "@/components/Card";
import FallIn from "@/components/FallIn";

export const revalidate = 60;

type Project = {
  _id: string;
  title: string;
  image?: string;
  color?: string;
};

const query = `*[_type == "project"] | order(_createdAt asc) {
  _id,
  title,
  "image": image.asset->url,
  color
}`;

export default async function ProjetsPage() {
  const projects = await sanity.fetch<Project[]>(query);

  return (
    <main className="min-h-screen px-16 py-20">
      <div className="flex flex-wrap justify-start gap-12">
        {projects.map((project, i) => (
          <FallIn key={project._id} delay={i * 0.05}>
            <div className="w-[380px] shrink-0">
              <Card
                title={project.title}
                image={project.image}
                color={project.color}
                index={i}
              />
            </div>
          </FallIn>
        ))}
      </div>
    </main>
  );
}
```

- [ ] **Step 2 : Vérifier que le dev server compile sans erreur**

```bash
npm run dev
```

Ouvrir `http://localhost:3000/projets`. Si Sanity ne contient pas encore de documents `project`, la page affiche une grille vide — c'est normal.

- [ ] **Step 3 : Commit**

```bash
git add src/app/projets/page.tsx
git commit -m "feat: page /projets avec cards Sanity en flex wrap"
```
