# Squish effect

Principe : **scaleY ↓ = scaleX ↑** (conservation du volume)

```js
// 1. Anticipation
.to(el, { scaleY: 1.15, scaleX: 0.88, y: -18, duration: 0.18, ease: "power2.out" })
// 2. Écrasement
.to(el, { scaleY: 0.65, scaleX: 1.28, y: 20, duration: 0.1, ease: "power4.in" })
// 3. Rebond
.to(el, { scaleY: 1.2, scaleX: 0.88, y: -12, duration: 0.16, ease: "power2.out" })
// 4. Retour élastique
.to(el, { scaleY: 1, scaleX: 1, y: 0, duration: 0.6, ease: "elastic.out(1, 0.3)" })
```

Plus les valeurs s'éloignent de 1, plus c'est cartoon.
