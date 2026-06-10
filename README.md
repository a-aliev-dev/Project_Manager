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

## Details

### - npm + Vite *(package.json, vite.config.ts)*

Das Projekt nutzt npm als Paketmanager und Vite als Bundler. In package.json ist das Startskript "dev": "vite" definiert.


### - React + TypeScript *(src/main.tsx, src/App.tsx, src/components/)*

Die Anwendung wurde als React-App mit TypeScript umgesetzt. Die Komponenten liegen als .tsx-Dateien vor.


### - Eigene Types *(src/types.ts)*

Zentrale Datentypen sind in src/types.ts definiert, unter anderem:

- Project
- ProjectStatus
- QuestTask
- TaskStatus
- TaskPriority
- LeaderboardEntry


### - Props von Komponenten *(src/components/DashboardStats.tsx, src/components/ProjectList.tsx, src/components/ProjectCard.tsx, src/components/AddProjectForm.tsx, src/components/Leaderboard.tsx)*

Die Komponenten verwenden eigene Props-Interfaces, zum Beispiel:

- DashboardStatsProps
- ProjectListProps
- ProjectCardProps
- AddProjectFormProps
- LeaderboardProps


### - Sinnvolle Komponenten *(src/components/)*

Die Anwendung ist in mehrere wiederverwendbare Komponenten zerlegt:

- AddProjectForm
- DashboardStats
- Leaderboard
- ProjectList
- ProjectCard
- TaskList
- TaskCard


### - Komponentenzerlegung statt Monolith *(src/App.tsx, src/components/)*

App.tsx dient als zentrale Orchestrierung der Anwendung. Darstellung und Interaktion sind auf einzelne Komponenten verteilt.


### - Props-Übergabe *(src/App.tsx, src/components/ProjectList.tsx, src/components/ProjectCard.tsx, src/components/DashboardStats.tsx, src/components/Leaderboard.tsx)*

Daten und Callback-Funktionen werden über Props weitergegeben. Beispiele:

- projects wird von App.tsx an ProjectList übergeben.
- project wird von ProjectList an ProjectCard übergeben.
- onAdvanceProject wird von App.tsx über ProjectList an ProjectCard weitergegeben.
- Statistikwerte werden an DashboardStats übergeben.
- Leaderboard-Daten werden an Leaderboard übergeben.


### - useState für lokalen Zustand *(src/App.tsx, src/components/AddProjectForm.tsx)*

In App.tsx wird die Projektliste mit useState<Project[]> verwaltet. In AddProjectForm.tsx werden Projektname und Projektstatus als Formularzustand mit useState verwaltet.


### - useEffect zum Laden und Speichern *(src/App.tsx)*

Beim ersten Rendern werden Projekte aus localStorage geladen oder mit initialProjects initialisiert. Bei Änderungen an der Projektliste werden die Daten wieder in localStorage gespeichert.


### - Durchgängige Nutzerinteraktion *(src/components/AddProjectForm.tsx, src/components/ProjectCard.tsx, src/App.tsx)*

Die App enthält echte Nutzerinteraktionen ohne Seitenreload:

- Nutzer können über ein Formular ein neues Projekt erstellen.
- Das neue Projekt erscheint direkt in der Projektliste.
- Nutzer können über einen Button den Fortschritt eines Projekts erhöhen.
- Bei 100 Prozent wird ein Projekt automatisch als abgeschlossen markiert.
- Änderungen bleiben über localStorage nach einem Reload erhalten.


### - Initiale Daten *(src/data/initialProjects.ts)*

Initiale Projektdaten und Leaderboard-Einträge sind typisiert ausgelagert.
