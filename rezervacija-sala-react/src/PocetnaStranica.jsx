import React from 'react';
import './PocetnaStranica.css';

// Primer: Ubacite vaše slike u /assets folder
const heroImage = 'https://picsum.photos/1200/600';
const room1 = 'https://picsum.photos/300/200?random=1';
const room2 = 'https://picsum.photos/300/200?random=2';
const room3 = 'https://picsum.photos/300/200?random=3';

const PocetnaStranica = () => {
  return (
    <div className="homepage">
      {/* Hero sekcija */}
      <section className="hero-section">
        <img src={heroImage} alt="Conference room" className="hero-image" />
        <div className="hero-overlay">
          <h1 className="hero-title">Rezervišite svoju savršenu salu</h1>
          <p className="hero-subtitle">
            Moderni prostori, vrhunska oprema i jednostavan sistem rezervacije.
          </p>
          <button className="hero-button">Pogledaj sale</button>
        </div>
      </section>

      {/* Sekcija sa ikonama/uslugama */}
      <section className="services-section">
        <h2>Naše usluge</h2>
        <div className="services-container">
          <div className="service-card">
            <i className="fa fa-calendar-check-o service-icon" aria-hidden="true"></i>
            <h3>Brza rezervacija</h3>
            <p>Rezervišite željenu salu u nekoliko klikova uz naš intuitivni interfejs.</p>
          </div>
          <div className="service-card">
            <i className="fa fa-tv service-icon" aria-hidden="true"></i>
            <h3>Najbolja oprema</h3>
            <p>Sve sale su opremljene modernom audio-vizuelnom opremom za vrhunsko iskustvo.</p>
          </div>
          <div className="service-card">
            <i className="fa fa-users service-icon" aria-hidden="true"></i>
            <h3>Fleksibilnost</h3>
            <p>Prilagodite raspored stolica, veličinu prostora i dodatne usluge.</p>
          </div>
        </div>
      </section>

      {/* Sekcija sa karticama sala */}
      <section className="rooms-section">
        <h2>Istaknute sale</h2>
        <div className="rooms-container">
          <div className="room-card">
            <div className="room-image-container">
              <img src={room1} alt="Room 1" className="room-image" />
            </div>
            <h3>Sala "Delta"</h3>
            <p>
              Kapacitet: 20 osoba. Idealna za poslovne sastanke i radionice.
            </p>
            <button className="room-button">Detaljnije</button>
          </div>
          <div className="room-card">
            <div className="room-image-container">
              <img src={room2} alt="Room 2" className="room-image" />
            </div>
            <h3>Sala "Omega"</h3>
            <p>
              Kapacitet: 50 osoba. Pogodna za konferencije i prezentacije.
            </p>
            <button className="room-button">Detaljnije</button>
          </div>
          <div className="room-card">
            <div className="room-image-container">
              <img src={room3} alt="Room 3" className="room-image" />
            </div>
            <h3>Sala "Gamma"</h3>
            <p>
              Kapacitet: 10 osoba. Savršena za manje timove i brainstorming sesije.
            </p>
            <button className="room-button">Detaljnije</button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <h3>Kontakt</h3>
          <p>Adresa: Ulica 123, Grad, Država</p>
          <p>Email: info@rezervacije.com</p>
          <p>Telefon: +381 11 123 4567</p>
        </div>
        <div className="footer-bottom">
          <p>&copy; 2024 Rezervacija Sala. Sva prava zadržana.</p>
        </div>
      </footer>
    </div>
  );
};

export default PocetnaStranica;
