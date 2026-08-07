# QuestBoard

**Team:**
Ali Aliev, Oleksii Kurov, Marin Corluka

**Repository:**
https://github.com/a-aliev-dev/Project_Manager

---

## Projektidee

QuestBoard ist eine gamifizierte Projektmanagement-Webanwendung. Projekte und Aufgaben werden als Quests dargestellt. Nutzer können Projekte erstellen, Projekten beitreten, Tasks übernehmen, Tasks abschließen und Teamleistung über XP und ein Leaderboard sichtbar machen.

Die Anwendung wurde in M1 als statischer HTML/CSS-Prototyp begonnen, in M2 zu einer React- und TypeScript-App mit Vite überführt und in M3 zu einer Full-Stack-Webanwendung mit eigenem Backend, REST-API, SQLite-Datenbank, Prisma ORM und JWT-Authentifizierung erweitert.

---

## Demo-Video

Das Demo-Video der Anwendung ist hier verfügbar:

[QuestBoard – Demo-Video]  https://www.youtube.com/watch?v=VNv5KePqm4w

---

## Aktueller Stand

QuestBoard besteht aktuell aus:

* React + TypeScript Frontend mit Vite
* React Router für mehrere Seiten
* Express Backend mit REST-Endpunkten
* SQLite-Datenbank mit Prisma ORM
* JWT-basierter Authentifizierung
* React Context für Login-Status und Token
* Fetch-basierter Kommunikation zwischen Frontend und Backend
* Lade- und Fehlerzuständen im Frontend
* API-Tests mit Vitest und Supertest

---

## Setup

Zum Installieren der Abhängigkeiten:

```bash
npm install
```

Prisma Client generieren:

```bash
npx prisma generate
```

Falls die Datenbank noch keine Testdaten enthält:

```bash
npx prisma db seed
```

Zum gleichzeitigen Starten von Frontend und Backend:

```bash
npm run dev
```

Das Frontend läuft unter:

```txt
http://localhost:5173
```

Das Backend läuft unter:

```txt
http://localhost:3001
```

Zum Starten nur des Frontends:

```bash
npm run client
```

Zum Starten nur des Backends:

```bash
npm run server
```

Zum Ausführen der Tests:

```bash
npm test
```

Zum einmaligen Ausführen der Tests ohne Watch-Modus:

```bash
npm test -- --run
```

Zum Prüfen des Builds:

```bash
npm run build
```

Prisma Studio öffnen:

```bash
npx prisma studio
```

---

## Testuser

Für die Anmeldung kann folgender Testuser verwendet werden:

```txt
E-Mail: max@test.de
Passwort: test123
```

Weitere Nutzer können über die Registrierungsseite angelegt werden.

---

## Nutzung

1. Anwendung mit `npm run dev` starten.
2. Startseite unter `http://localhost:5173` öffnen.
3. Über `/login` mit dem Testuser einloggen oder einen neuen Account registrieren.
4. Auf der Startseite Projekte ansehen oder ein neues Projekt erstellen.
5. Ein Projekt öffnen.
6. Dem Projekt beitreten.
7. Tasks erstellen, übernehmen und abschließen.
8. XP, Fortschritt und Leaderboard werden nach Aktionen aktualisiert.

---

## Frontend-Routen

| Route                  | Beschreibung                                                     |
| ---------------------- | ---------------------------------------------------------------- |
| `/`                    | Startseite mit Projektübersicht, Projektformular und Leaderboard |
| `/projects/:projectId` | Detailseite eines Projekts mit Tasks und Projektmitgliedern      |
| `/login`               | Login- und Registrierungsseite                                   |
| `*`                    | Fallback-Route zurück zur Startseite                             |

---

## API-Endpunkte

| Methode | Pfad                      | Beschreibung                               | Geschützt |
| ------- | ------------------------- | ------------------------------------------ | --------- |
| `GET`   | `/api/health`             | Prüft, ob das Backend läuft                | Nein      |
| `POST`  | `/api/auth/register`      | Registrierung eines neuen Nutzers          | Nein      |
| `POST`  | `/api/auth/login`         | Login und Rückgabe eines JWT               | Nein      |
| `GET`   | `/api/projects`           | Lädt alle Projekte                         | Nein      |
| `GET`   | `/api/projects/:id`       | Lädt ein Projekt mit Tasks und Mitgliedern | Nein      |
| `POST`  | `/api/projects`           | Erstellt ein neues Projekt                 | Ja        |
| `POST`  | `/api/projects/:id/join`  | Nutzer tritt einem Projekt bei             | Ja        |
| `POST`  | `/api/projects/:id/leave` | Nutzer verlässt ein Projekt                | Ja        |
| `POST`  | `/api/tasks`              | Erstellt einen neuen Task                  | Ja        |
| `PATCH` | `/api/tasks/:id/assign`   | Nutzer übernimmt einen Task                | Ja        |
| `PATCH` | `/api/tasks/:id/complete` | Nutzer schließt einen Task ab              | Ja        |
| `GET`   | `/api/leaderboard`        | Lädt Nutzer nach XP sortiert               | Nein      |

Geschützte Endpunkte erwarten einen JWT im Header:

```txt
Authorization: Bearer <JWT>
```

---

## Architektur

```txt
React SPA
  |
  | fetch()
  | Authorization: Bearer <JWT>
  v
Express REST API
  |
  v
Prisma Client
  |
  v
SQLite Datenbank
```

Das Frontend ist eine Single Page Application. Die UI wird im Browser gerendert und kommuniziert über REST-Endpunkte mit dem Backend. Das Backend kapselt den Zugriff auf die SQLite-Datenbank über Prisma und prüft geschützte Aktionen über JWT.

SSR oder SSG ist für QuestBoard nicht notwendig, weil die Anwendung stark interaktiv ist, Login-Zustand verwendet und Daten nach Nutzeraktionen dynamisch aktualisiert werden.

---

## Projektstruktur

```txt
prisma/
├── schema.prisma
└── seed.cjs

src/
├── api/
│   └── questBoardApi.ts
├── components/
│   ├── AddProjectForm.tsx
│   ├── AddTaskForm.tsx
│   ├── DashboardStats.tsx
│   ├── Leaderboard.tsx
│   ├── ProjectCard.tsx
│   ├── ProjectList.tsx
│   ├── TaskCard.tsx
│   └── TaskList.tsx
├── context/
│   └── AuthContext.tsx
├── pages/
│   ├── HomePage.tsx
│   ├── LoginPage.tsx
│   └── ProjectDetailPage.tsx
├── App.tsx
├── main.tsx
└── types.ts

server/
├── db/
│   ├── prisma.cjs
│   └── questboard.sqlite
├── middleware/
│   └── auth.cjs
├── routes/
│   ├── auth.cjs
│   ├── leaderboard.cjs
│   ├── projects.cjs
│   └── tasks.cjs
├── api.test.cjs
└── index.cjs

prisma.config.ts
```

---

## Kriterien-Zuordnung M2

| Kriterium                 | Datei                                                       | Hinweis                                                                             |
| ------------------------- | ----------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| npm + Vite                | `package.json`, `vite.config.ts`                            | Projekt wurde mit Vite erstellt                                                     |
| React + TypeScript        | `src/main.tsx`, `src/App.tsx`, `src/types.ts`               | React-Komponenten mit TypeScript                                                    |
| TypeScript aktiv genutzt  | `src/types.ts`, `src/components/`                           | Eigene Types/Interfaces für Projekte, Tasks und Leaderboard                         |
| Komponentenzerlegung      | `src/components/`                                           | Wiederverwendbare Komponenten für Projekte, Tasks, Formulare, Stats und Leaderboard |
| Props-Übergabe            | `src/components/`                                           | Daten und Callback-Funktionen werden über Props weitergegeben                       |
| `useState`                | `src/components/`, `src/pages/`                             | Formularwerte, Ladezustände und UI-Zustände                                         |
| `useEffect`               | `src/pages/HomePage.tsx`, `src/pages/ProjectDetailPage.tsx` | Laden von API-Daten beim Rendern                                                    |
| Durchgängige Nutzeraktion | `src/components/`, `src/pages/`                             | Projekt/Task erstellen, Projekt öffnen, Task übernehmen und abschließen             |

---

## Kriterien-Zuordnung M3

| Kriterium             | Datei                                                                                  | Hinweis                                                                                                 |
| --------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| React Router          | `src/main.tsx`, `src/App.tsx`                                                          | Die App nutzt `BrowserRouter`, `Routes`, `Route`, `Navigate`                                            |
| Mehrere Seiten/Routen | `src/pages/HomePage.tsx`, `src/pages/ProjectDetailPage.tsx`, `src/pages/LoginPage.tsx` | Startseite, Projektseite und Loginseite sind getrennte Views                                            |
| Navigation            | `src/pages/HomePage.tsx`, `src/pages/ProjectDetailPage.tsx`, `src/pages/LoginPage.tsx` | Navigation mit `Link`, `useNavigate` und `useParams`                                                    |
| REST-API mit Fetch    | `src/api/questBoardApi.ts`                                                             | Zentrale API-Funktionen mit `fetch`                                                                     |
| GET-Endpunkt          | `server/routes/projects.cjs`, `server/routes/leaderboard.cjs`                          | Projekte, Projektdetails und Leaderboard werden geladen                                                 |
| Schreibender Endpunkt | `server/routes/projects.cjs`, `server/routes/tasks.cjs`                                | `POST /api/projects`, `POST /api/tasks`, `PATCH /api/tasks/:id/assign`, `PATCH /api/tasks/:id/complete` |
| Ladezustände          | `src/pages/HomePage.tsx`, `src/pages/ProjectDetailPage.tsx`                            | Während API-Aufrufen werden Ladehinweise angezeigt                                                      |
| Fehlerzustände        | `src/pages/HomePage.tsx`, `src/pages/ProjectDetailPage.tsx`, `src/pages/LoginPage.tsx` | API- und Loginfehler werden als Fehlermeldung dargestellt                                               |
| Geteilter State       | `src/context/AuthContext.tsx`                                                          | Loginstatus, User und JWT werden über React Context geteilt                                             |
| Backend               | `server/index.cjs`                                                                     | Express-Server mit REST-Routen                                                                          |
| Datenbank             | `prisma/schema.prisma`, `server/db/questboard.sqlite`                                 | SQLite-Datenbank mit Prisma ORM                                                                         |
| Authentifizierung     | `server/routes/auth.cjs`, `server/middleware/auth.cjs`                                 | Registrierung, Login und JWT-Validierung                                                                |
| JWT                   | `server/routes/auth.cjs`, `server/middleware/auth.cjs`, `src/context/AuthContext.tsx`  | JWT wird beim Login erzeugt, gespeichert und bei geschützten Requests gesendet                          |
| Geschützte Endpunkte  | `server/routes/projects.cjs`, `server/routes/tasks.cjs`                                | Schreibende Aktionen verwenden `requireAuth`                                                            |
| Tests                 | `server/api.test.cjs`                                                                  | API-Tests mit Vitest, Supertest und Prisma                                                              |
| Build                 | `vite.config.ts`, `package.json`                                                       | `npm run build` läuft erfolgreich                                                                       |
| Architektur           | `src/`, `server/`, `prisma/`                                                          | Trennung zwischen React-Frontend, Express-Backend und Prisma-Datenbankschicht                            |

---

## Tests

Die API wird mit Vitest und Supertest getestet.

Getestet werden unter anderem:

* Laden aller Projekte
* Login mit JWT
* Schutz von Endpunkten ohne Token
* Erstellen eines Projekts mit Token
* Erstellen eines Tasks mit Token
* Übernehmen eines Tasks mit Token
* Abschließen eines Tasks mit Token
* Laden des Leaderboards nach XP

Tests ausführen:

```bash
npm test
```

Einmaliger Testlauf:

```bash
npm test -- --run
```

Aktueller Stand:

```txt
8 von 8 Tests bestanden
```

---

## Build

Der Produktionsbuild kann mit folgendem Befehl geprüft werden:

```bash
npm run build
```

Der Build wurde nach der Prisma-Umstellung erfolgreich ausgeführt.

---

## Hinweise zur Datenbank

Die SQLite-Datenbank wird unter `server/db/questboard.sqlite` gespeichert.

Der Datenbankzugriff erfolgt vollständig über Prisma. Das Datenbankschema befindet sich in:

```txt
prisma/schema.prisma
```

Seed-Daten können mit folgendem Befehl angelegt werden:

```bash
npx prisma db seed
```

Das Seed-Skript legt Testnutzer, Beispielprojekte, Projektmitgliedschaften und Beispielaufgaben an, wenn noch keine Benutzer vorhanden sind.

Die Datenbank wird nicht mehr automatisch beim Start des Backends durch direkte SQL-Abfragen angelegt oder befüllt.

---

## Kurzfassung der M3-Umsetzung

QuestBoard erfüllt in M3 die zentralen Anforderungen durch:

* React Router für mehrere Seiten
* REST-Kommunikation mit `fetch`
* eigenes Express-Backend
* SQLite-Datenbank
* Prisma ORM für den Datenbankzugriff
* JWT-Authentifizierung
* geschützte API-Endpunkte
* globalen Auth-State mit React Context
* Lade- und Fehlerzustände
* dynamisches Leaderboard
* API-Tests mit Vitest/Supertestq