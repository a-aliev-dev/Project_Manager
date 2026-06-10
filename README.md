# QuestBoard

**Team:**  
Ali Aliev, Oleksii Kurov, Marin Corluka

**Repository:**  
https://github.com/a-aliev-dev/Project_Manager

---

## Projektidee

QuestBoard ist eine gamifizierte Projektmanagement-Webanwendung. Projekte und Aufgaben werden als Quests dargestellt. Nutzer können Projekte anlegen, Fortschritte erhöhen und Teamleistung über XP und ein Leaderboard sichtbar machen.

Der statische HTML/CSS-Prototyp aus M1 wurde für M2 in eine React- und TypeScript-App mit Vite überführt.

---

## Setup

Zum Starten der Anwendung:

```bash
npm install
npm run dev
```

Die App läuft danach lokal unter http://localhost:5173/.

---

## Kriterien-Zuordnung M2

| Kriterium | Datei | Hinweis |
|---|---|---|
| npm + Vite | package.json, vite.config.ts | Projekt wurde mit Vite erstellt |
| React + TypeScript | src/App.tsx, src/types.ts | React-Komponenten mit TypeScript |
| TypeScript aktiv genutzt | src/types.ts | Eigene Types/Interfaces für Projektdaten |
| Komponentenzerlegung | src/components/ | Mehrere wiederverwendbare Komponenten |
| Props-Übergabe | src/App.tsx | Daten und Funktionen werden per Props weitergegeben |
| useState | src/App.tsx | Zustand für Projekte, Fortschritt oder Formular |
| useEffect | src/App.tsx | Wird für Laden/Speichern oder Initialisierung genutzt |
| Durchgängige Nutzeraktion | src/components/ | Projekt erstellen oder Fortschritt erhöhen verändert die UI |
