## Survey Form Platform

Ein vollständiges Webprojekt für die mehrsprachige KESB-Erhebung mit professionellem Frontend, persistenter Datenspeicherung und sofort verfügbaren Auswertungen.

### Architektur

- **Frontend:** React + Vite (TypeScript), mehrstufige Formulare, Zustand-Management mit Zustand, direkte API-Anbindung.
- **Backend:** Node.js mit Express, SQLite (über `better-sqlite3`) zur Datenspeicherung, Auswertung-Endpunkte.
- **Datenbasis:** Offizielle KESB-Liste (`backend/data/kesb.json`), kann bei Bedarf durch erneuten Import aktualisiert werden.

### Voraussetzungen

- Node.js ≥ 18
- pnpm oder npm

### Installation

```bash
npm install
```

### Entwicklung starten

```bash
npm run dev
```

Der Befehl startet Frontend (`5173`) und Backend (`4000`) parallel. Rufen Sie das Frontend unter `http://localhost:5173/unibas/survey/` auf. CORS ist bereits vorkonfiguriert.

### Produktion

```bash
npm run build
```

Die gebauten Artefakte befinden sich anschließend in `frontend/dist` (Frontend) sowie `backend/dist` (Backend).  
Das Backend benötigt Zugriff auf die Datenbankdatei (`responses.db`). Diese wird beim ersten Start automatisch angelegt.

### Betrieb unter `www.famkb.ch/unibas/survey`

- **Backend**: setzen Sie in `.env` den Pfad

  ```
  BASE_PATH=/unibas/survey
  ```

  Dadurch werden alle REST-Endpunkte sowie die bereitgestellten Dateien unter `https://www.famkb.ch/unibas/survey/api/...` bzw. `.../data/...` ausgeliefert.

- **Frontend**: legen Sie eine Datei `frontend/.env` mit folgendem Inhalt an (oder setzen Sie die Variablen per Build-System):

  ```
  VITE_BASE_PATH=/unibas/survey/
  VITE_API_BASE=/unibas/survey/api
  ```

  Anschließend `npm run build` ausführen; die gebauten Dateien erwarten den Aufruf unter `https://www.famkb.ch/unibas/survey`.

- **Reverse-Proxy**: leiten Sie den Pfad `/unibas/survey` auf das Frontend (z.B. die statischen Dateien) und `/unibas/survey/api` auf das Node.js-Backend weiter.

### Anpassungen

- Hintergrundbilder können in `Annex1/` ausgetauscht werden (beachten Sie gleichbleibende Dateinamen).
- Die KESB-Liste lässt sich durch Ersetzen von `backend/data/kesb.json` aktualisieren.
- Weitere Auswertungen lassen sich über die bestehenden Endpunkte (`/api/reports/*`) erweitern.

### API-Übersicht

- `GET /api/kesb` – Liste aller KESB für das Auswahlfeld.
- `POST /api/responses` – Speichert eine ausgefüllte Umfrage.
- `GET /api/reports/summary` – Aggregationen (Sprache, Frage 1).
- `GET /api/reports/detail/:language` – Detailansicht (optional nach Sprache gefiltert).

### Sicherheit & Datenschutz

- Für den Produktivbetrieb empfiehlt sich ein Reverse-Proxy (z.B. Nginx) sowie HTTPS.

