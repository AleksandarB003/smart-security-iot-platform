# Smart Security IoT Platform (based on ZKP Protocol)

IoT platforma za bezbedno upravljanje uređajima gde se uređaji **ne** autentifikuju lozinkama ili API ključevima, već dokazuju svoj identitet kroz **Zero-Knowledge Proof** (Schnorr protokol), pri čemu server nikad ne vidi niti čuva privatni ključ uređaja.

Projekat sadrži tri nezavisna paketa (backend, device simulator, dashboard) i demonstrira ceo tok od kriptografske autentifikacije do live prikaza bezbednosnih događaja.

## Arhitektura

Platforma se sastoji iz tri nezavisna paketa koji komuniciraju preko REST API-ja i WebSocket-a.

**Backend** (Express, Prisma, PostgreSQL) je centralna komponenta. Prima ZKP autentifikaciju, čuva podatke o uređajima i eventima, i preko WebSocket-a uživo obaveštava povezane klijente o svakoj promeni.

**Device Simulator** je nezavisan Node.js proces koji pokreće nasumičan broj (5-15) simuliranih IoT senzora. Svaki uređaj generiše sopstveni ZKP ključni par, registruje se, autentifikuje se, i periodično šalje telemetriju i bezbednosne evente ka backend-u.

**Dashboard** (React) povlači listu uređaja preko REST-a i prati live feed događaja preko WebSocket konekcije, bez potrebe za ručnim osvežavanjem.

- **Backend**: REST API, ZKP verifikacija, WebSocket broadcast, baza podataka
- **Device Simulator**: nezavisan proces koji pokreće nasumičan broj (5-15) simuliranih senzora, svaki sa svojim ZKP ključnim parom
- **Dashboard**: React aplikacija, prikazuje uređaje uživo i live feed bezbednosnih događaja preko WebSocket-a

## Zero-Knowledge Proof autentifikacija

Umesto slanja lozinke, uređaj dokazuje da poznaje tajni broj (privatni ključ), a da ga nikad ne otkrije. Koristi se **Schnorr protokol** sa **Fiat-Shamir** transformacijom (non-interactive ZKP), implementiran u [`schnorr-zkp-toolkit`](https://github.com/AleksandarB003/zkp-toolkit).

**Registracija:** uređaj generiše par ključeva `(x, y = g^x mod p)` i serveru šalje samo javni ključ `y`. Privatni ključ `x` nikad ne napušta uređaj.

**Autentifikacija (svaki put iznova):**
1. Uređaj bira nasumičan broj `r`, računa commitment `t = g^r mod p`
2. Računa challenge `c = hash(g, y, t)` (Fiat-Shamir, zamenjuje interaktivnog verifikatora)
3. Računa response `s = r + c*x mod q`, šalje `(t, c, s, y)` serveru
4. Server proverava `g^s = t * y^c mod p`, što je tačno ako i samo ako uređaj zna `x`
5. Server upisuje pokušaj u audit log; ponovljen `commitment` (isti `t`) se odbija, čime je obezbeđena zaštita od replay napada

Nakon uspešne autentifikacije, server izdaje **privremeni session token** (1h) koji uređaj koristi za slanje telemetrije, bez ponovnog ZKP dokazivanja za svaki event.

## Tech stack

| Deo | Tehnologije |
|---|---|
| Backend | Node.js, TypeScript, Express, Prisma ORM, PostgreSQL, `ws` (WebSocket) |
| Device Simulator | Node.js, TypeScript, `schnorr-zkp-toolkit` |
| Dashboard | React, TypeScript, Vite, `lucide-react` |
| ZKP jezgro | autorska biblioteka `schnorr-zkp-toolkit` |

## Struktura projekta

```
smart-security-iot-platform/
  backend/
    prisma/schema.prisma       baza: Device, ProofLog, SecurityEvent, User, ZkpParams
    src/modules/zkp/           deljeni ZKP parametri
    src/modules/devices/       registracija, telemetrija
    src/modules/auth/          ZKP verifikacija, session tokeni
    src/modules/events/        bezbednosni eventi
    src/websocket.ts           live broadcast
    scripts/                   test i dev skripte
  device-simulator/
    src/deviceTypes.ts         5 tipova senzora, dinamicki eventi
    src/simulatedDevice.ts     zivotni ciklus jednog uredjaja
  frontend/
    src/components/            DeviceGrid, EventFeed...
    src/hooks/                 useDevices, useLiveFeed
    src/styles/tokens.css      dizajn sistem
```

## Pokretanje

Potreban Docker (za lokalnu PostgreSQL bazu) i Node.js.

**1. Backend**
```bash
cd backend
npm install
cp .env.example .env
docker compose up -d
npx prisma migrate dev
npm run dev
```
Server na `http://localhost:3000`.

**2. Device Simulator** (u novom terminalu)
```bash
cd device-simulator
npm install
npm start
```

**3. Dashboard** (u novom terminalu)
```bash
cd frontend
npm install
npm run dev
```
Dashboard na `http://localhost:5173`.

### Razvojne skripte (backend)

| Skripta | Svrha |
|---|---|
| `npm run test:auth-flow` | End-to-end test ZKP toka (registracija, proof, autentifikacija, replay, eventi) |
| `npm run test:websocket` | Povezuje se na `/ws` i ispisuje sve live broadcast poruke |
| `npm run db:reset-devices` | Briše sve uređaje pre svežeg pokretanja simulatora |

`db:reset-devices` je namerno **lokalna skripta**, ne REST endpoint. Operacija koja briše sve uređaje ne sme biti dostupna preko mreže bez autentifikacije, bez obzira koliko je zgodna za razvoj.

## API pregled

| Endpoint | Opis |
|---|---|
| `GET /api/zkp/params` | Deljeni Schnorr parametri (p, q, g) |
| `POST /api/devices` | Registracija uređaja |
| `GET /api/devices` | Lista svih uređaja |
| `PATCH /api/devices/:id/telemetry` | Ažuriranje baterije/armed statusa (traži session token) |
| `POST /api/devices/:id/authenticate` | ZKP autentifikacija, vraća session token |
| `POST /api/devices/:id/events` | Zabeleži bezbednosni event (traži session token) |
| `GET /api/events` | Globalni feed poslednjih eventa |
| `GET /health` | Provera da je server i baza dostupna |
| `WS /ws` | Live broadcast (`event`, `device_update`, `device_registered`) |

## Bezbednosne mere

Projekat je prošao interni security audit (5 kategorija: cost abuse, injection paths, DB access, auth, exposed secrets), i jedan naknadni pregled posle dodavanja WebSocket sloja i dashboard-a. Konkretne mere:

- **Replay zaštita**: `commitment` iz svakog ZKP proof-a je jedinstven u bazi, ponovljen proof se odbija
- **Session tokeni**: telemetrija i eventi zahtevaju token izdat pri autentifikaciji, ne samo poznavanje ID-ja uređaja
- **Kontrolisano rukovanje greškama**: neispravan proof format vraća 400, ne ruši server
- **Rate/query limit**: `limit` parametar na listing endpoint-ima ograničen (max 200)
- **`.env` nikad u git-u**: tajne (connection string) samo lokalno
- **CORS eksplicitno konfigurisan**, ne otvoren nasumično
- **Session token nikad ne napušta server osim u direktnom odgovoru na `/authenticate`**: naknadni pregled je otkrio da su `GET /api/devices` i WebSocket broadcast-i vraćali pun objekat uređaja, uključujući aktivan token. Ispravljeno tako da se token uklanja pre svakog izlaska iz servera, osim u tom jednom legitimnom slučaju.
- **Brisanje uređaja nije izloženo preko mreže**: postoji samo kao lokalna razvojna skripta, ne kao API ruta

## Napomena

`schnorr-zkp-toolkit` je autorska biblioteka. Koristi se demo veličina ključa od 128 bita radi brzine. Za produkciju bi trebalo >=2048 bita, što je dokumentovan kompromis, ne previd.