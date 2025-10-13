# Rezervacija sala  

## Opis
Aplikacija za rezervaciju sala sa jasnim razdvajanjem frontenda (React) i backenda (Laravel).
Podržava pregled i filtriranje sala, rezervacije sa paginacijom i CSV izvozom, vizuelnu mapu sprata,
administraciju resursa i korisnika, kao i autentikaciju sa ulogama.

## Ključne funkcionalnosti
- Katalog sala: pretraga, filteri (tip, kapacitet), sortiranje, paginacija.
- Rezervacije: kreiranje/izmena/brisanje, statusi (pending/approved/rejected/cancelled),
  paginacija + filtriranje, CSV izvoz.
- Preporuke: generisanje i čuvanje preporučenih sala po preferencijama (datum, vreme, kapacitet, tip).
- Mapa sprata: pregled sala na mreži; admin može drag&drop da menja raspored (x, y, w, h, sprat).
- Administracija sala: CRUD, upload fajlova, cena, status, sprat i koordinate.
- Korisnici: CRUD (samo admin), promene uloga.
- Autentikacija i uloge: registracija, prijava/odjava (Sanctum token), zaštita ruta.
- Reset lozinke: slanje linka i postavljanje nove lozinke.
- Admin dashboard: KPI (korisnici, sale, rezervacije), grafikoni (dnevno, po tipu, po satu), iskorišćenost.

## Tehnologije
- Backend: Laravel (PHP), Eloquent ORM, Sanctum, REST JSON API, MySQL.
- Frontend: React (Vite/CRA), React Router, kontekst za autentikaciju, prilagođeni hook-ovi.
- Grafikoni: Recharts (dashboard).

 

## 1) Backend (Laravel) — pokretanje
---------------------------------
### Kloniraj repo i uđi u laravel projekat
composer install
cp .env.example .env
### Podesi u .env konekciju ka bazi (DB_*), APP_URL, FRONTEND_URL
php artisan key:generate
php artisan migrate --seed   # kreira šemu i inicijalne podatke (ako postoje seed-ovi)
php artisan serve            # pokreće API na http://127.0.0.1:8000

## 2) Frontend (React) — pokretanje
--------------------------------
### U folderu react aplikacije
npm install
### Ako je potrebno, u src/api/client.js prilagodi baseURL (npr. http://localhost:8000/api)
npm run dev                  # Vite dev server, npr. http://127.0.0.1:5173 (ili http://localhost:3000)
### Produkcijski build: npm run build && npm run preview

 
 
