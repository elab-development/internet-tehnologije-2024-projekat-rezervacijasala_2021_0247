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
          <p className="eyebrow">Aplikacija za rezervaciju sala</p>
          <h1>
            Pametno upravljanje salama i rezervacijama<br />
            <span className="accent">brzo, sigurno i pregledno</span>
          </h1>
          <p className="subtitle">
            Od pregleda kataloga i preporuka, do brze rezervacije i administracije sala — sve na jednom mestu.
          </p>
          <div className="hero-ctas">
            <a className="btn btn--ghost" href="/katalog">Pogledaj katalog</a>
            <a className="btn btn--ghost" href="#funkcionalnosti">Pogledaj mogućnosti</a>
          </div>
        </section>
      </header>

      <main className="lp-main" id="sadržaj">
        {/* Sekcija funkcionalnosti */}
        <section id="funkcionalnosti" className="features" aria-labelledby="features-title">
          <h2 id="features-title">Šta aplikacija omogućava</h2>
          <p className="section-lead">
            Ključne funkcije za korisnike i administratore, osmišljene da olakšaju svakodnevni rad.
          </p>

          <div className="grid">
            <article className="card">
              <div className="card-ico" aria-hidden="true">🧾</div>
              <h3>Rezervacije</h3>
              <p>
                Brza izrada rezervacije, pregled postojećih termina i uređivanje po potrebi.
                Dostupno paginiranje i pregled po datumu i vremenu.
              </p>
            </article>

            <article className="card">
              <div className="card-ico" aria-hidden="true">💡</div>
              <h3>Preporuke</h3>
              <p>
                Predlozi sala na osnovu tipa događaja, očekivanog broja učesnika i preferencija termina.
              </p>
            </article>

            <article className="card">
              <div className="card-ico" aria-hidden="true">🏟️</div>
              <h3>Upravljanje salama</h3>
              <p>
                Administracija prostora: dodavanje i izmena sala, statusi, kapaciteti, opisi i prateći fajlovi.
              </p>
            </article>

            <article className="card">
              <div className="card-ico" aria-hidden="true">🗺️</div>
              <h3>Mapa sprata</h3>
              <p>
                Vizuelni prikaz rasporeda sala. Administrator može menjati pozicije i dimenzije, korisnici mogu započeti rezervaciju klikom na salu.
              </p>
            </article>

            <article className="card">
              <div className="card-ico" aria-hidden="true">🔐</div>
              <h3>Nalozi i uloge</h3>
              <p>
                Registracija i prijava korisnika, kontrola pristupa i različite privilegije za korisnike, menadžere i administratore.
              </p>
            </article>

            <article className="card">
              <div className="card-ico" aria-hidden="true">🛟</div>
              <h3>Reset lozinke</h3>
              <p>
                Zaboravili ste lozinku? Zatražite link za reset i jednostavno postavite novu.
              </p>
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
                <li>Pregled kataloga sala</li>
                <li>Kreiranje i pregled sopstvenih rezervacija</li>
                <li>Preporuke na osnovu potreba</li>
              </ul>
            </div>
            <div className="role role--manager">
              <h3>🧭 Menadžer</h3>
              <ul>
                <li>Napredan uvid u rezervacije</li>
                <li>Učešće u upravljanju salama</li>
                <li>Pregled preporuka</li>
              </ul>
            </div>
            <div className="role role--admin">
              <h3>🛡️ Administrator</h3>
              <ul>
                <li>Potpuna administracija sala</li>
                <li>Uređivanje rasporeda na mapi</li>
                <li>Postavke i održavanje sistema</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Kako funkcioniše */}
        <section className="how" aria-labelledby="how-title">
          <h2 id="how-title">Kako funkcioniše</h2>
          <ol className="steps">
            <li><strong>Prijavi se ili registruj:</strong> brzo kreiranje naloga i pristup funkcijama.</li>
            <li><strong>Pronađi salu:</strong> pretraži i filtriraj po tipu, kapacitetu i dostupnosti.</li>
            <li><strong>Rezerviši termin:</strong> izaberi datum, vreme i tip događaja.</li>
            <li><strong>Iskoristi preporuke:</strong> dobij predloge sala prilagođene potrebama.</li>
            <li><strong>Administriraj (po ulozi):</strong> uređuj sale, raspored i odobri/odbij rezervacije.</li>
          </ol>
        </section>

        {/* CTA sekcija */}
        <section className="cta" aria-labelledby="cta-title">
          <h2 id="cta-title">Spreman/na za probu?</h2>
          <p>
            Započni rezervaciju ili istraži katalog sala i pronađi idealan prostor za svoj događaj.
          </p>
          <div className="hero-ctas">
            <a className="btn btn--ghost" href="/katalog">Kreni u katalog</a>
            <a className="btn btn--ghost" href="/login">Prijavi se</a>
          </div>
        </section>
      </main>

      <footer className="lp-footer" role="contentinfo">
        <p>© {new Date().getFullYear()} SalaHub • Sistem za rezervaciju sala</p>
      </footer>
    </div>
  );
}
