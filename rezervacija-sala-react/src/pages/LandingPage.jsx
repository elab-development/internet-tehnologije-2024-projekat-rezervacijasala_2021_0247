import React from "react";
import "./landing.css";

export default function LandingPage() {
  return (
    <div className="lp">
      {/* Dekorativna pozadina */}
      <div aria-hidden="true" className="lp-bg">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      <header className="lp-header" role="banner">
    

        <section className="hero">
          <p className="eyebrow">Laravel API + React UI</p>
          <h1>
            Pametno upravljanje salama i rezervacijama<br />
            <span className="accent">brzo, sigurno i pregledno</span>
          </h1>
          <p className="subtitle">
            Ova aplikacija demonstrira ključne funkcionalnosti: rezervacije sa paginacijom i CSV
            izvozom, preporuke, upravljanje salama sa uploadom fajlova, autentikaciju/uloge,
            reset lozinke i konverziju cena po kursu.
          </p>
          <div className="hero-ctas">
            <a className="btn btn--primary" href="/app">Uđi u aplikaciju</a>
            <a className="btn btn--ghost" href="#funkcionalnosti">Pogledaj mogućnosti</a>
          </div>
        </section>
      </header>

      <main className="lp-main" id="sadržaj">
        {/* Sekcija funkcionalnosti */}
        <section id="funkcionalnosti" className="features" aria-labelledby="features-title">
          <h2 id="features-title">Šta aplikacija omogućava</h2>
          <p className="section-lead">
            Ispod je sažet pregled modula i ruta koje stoje iza njih.
          </p>

          <div className="grid">
            <article className="card">
              <div className="card-ico" aria-hidden="true">🧾</div>
              <h3>Rezervacije</h3>
              <p>
                Lista, kreiranje, izmena i brisanje rezervacija uz{" "}
                <strong>paginaciju i filtriranje</strong> ({`GET /rezervacije/paginacija`}) i{" "}
                <strong>CSV izvoz</strong> ({`GET /rezervacije/export/csv`}). Dostupno ulogama
                <em> korisnik</em> i <em>menadžer</em>.
              </p>
              <code className="endpoint">GET /rezervacije • POST /rezervacije • PUT/DELETE /rezervacije/:id</code>
            </article>

            <article className="card">
              <div className="card-ico" aria-hidden="true">💡</div>
              <h3>Preporuke</h3>
              <p>
                CRUD nad preporukama (npr. predlozi sala/projekcija). Rute zahtevaju prijavu.
              </p>
              <code className="endpoint">GET/POST /preporuke • GET/PUT/DELETE /preporuke/:id</code>
            </article>

            <article className="card">
              <div className="card-ico" aria-hidden="true">🏟️</div>
              <h3>Sale & Upload</h3>
              <p>
                Administracija sala (resource rute) i upload fajlova za konkretnu salu.
                Dostupno ulogama <em>administrator</em> i <em>menadžer</em>.
              </p>
              <code className="endpoint">/sale (REST) • POST /sale/upload/:id</code>
            </article>

            <article className="card">
              <div className="card-ico" aria-hidden="true">🔐</div>
              <h3>Autentikacija i uloge</h3>
              <p>
                Registracija, prijava, odjava (Sanctum), zaštita ruta i kontrola pristupa po ulogama.
              </p>
              <code className="endpoint">POST /registracija • POST /prijava • POST /odjava</code>
            </article>

            <article className="card">
              <div className="card-ico" aria-hidden="true">🛟</div>
              <h3>Reset lozinke</h3>
              <p>
                Slanje linka za reset i postavljanje nove lozinke.
              </p>
              <code className="endpoint">POST /password/email • POST /password/reset</code>
            </article>

            <article className="card">
              <div className="card-ico" aria-hidden="true">💱</div>
              <h3>Konverzija cena</h3>
              <p>
                Prikaži cenu sale u željenoj valuti koristeći aktuelne kurseve.
              </p>
              <code className="endpoint">GET /sala/:id/konverzija/:valuta</code>
            </article>
          </div>
        </section>

        {/* Sekcija uloga */}
        <section className="roles" aria-labelledby="roles-title">
          <h2 id="roles-title">Uloge i pristup</h2>
          <div className="roles-grid">
            <div className="role role--user">
              <h3>👤 Korisnik</h3>
              <ul>
                <li>Pregled & kreiranje sopstvenih rezervacija</li>
                <li>Paginacija i filtriranje</li>
                <li>CSV izvoz (kada je dozvoljeno)</li>
              </ul>
            </div>
            <div className="role role--manager">
              <h3>🧭 Menadžer</h3>
              <ul>
                <li>Napredna administracija rezervacija</li>
                <li>Upravljanje salama (zajedno sa adminom)</li>
                <li>Uvid u preporuke</li>
              </ul>
            </div>
            <div className="role role--admin">
              <h3>🛡️ Administrator</h3>
              <ul>
                <li>Potpuna kontrola nad salama</li>
                <li>Upload fajlova za sale</li>
                <li>Postavke sistema</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Kako funkcioniše */}
        <section className="how" aria-labelledby="how-title">
          <h2 id="how-title">Kako funkcioniše</h2>
          <ol className="steps">
            <li><strong>Registracija i prijava:</strong> kreiraj nalog i uloguj se (Sanctum token).</li>
            <li><strong>Rad sa podacima:</strong> upravljaj rezervacijama i preporukama prema ulozi.</li>
            <li><strong>Administracija sala:</strong> (menadžer/admin) uređivanje i upload pratećih fajlova.</li>
            <li><strong>Konverzija cena:</strong> proveri cenu sale u željenoj valuti.</li>
            <li><strong>CSV izvoz:</strong> preuzmi izveštaj rezervacija kada je potrebno.</li>
          </ol>
        </section>
 

        {/* CTA sekcija */}
        <section className="cta" aria-labelledby="cta-title">
          <h2 id="cta-title">Spreman/na za probu?</h2>
          <p>
            Ova početna stranica je samo informativna. Poveži je sa svojim rutama u React Router-u i
            nastavi razvoj.
          </p>
          <div className="hero-ctas">
            <a className="btn btn--primary" href="/login">Prijavi se</a>
            <a className="btn btn--ghost" href="/registracija">Napravi nalog</a>
          </div>
        </section>
      </main>

      <footer className="lp-footer" role="contentinfo">
        <p>© {new Date().getFullYear()} SalaHub • Demo interfejs za Laravel API</p>
      </footer>
    </div>
  );
}
