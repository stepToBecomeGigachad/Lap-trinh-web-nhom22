import Link from 'next/link';

export default function Home() {
  return (
    <>
      <header className="site-header">
        <div className="container header-top">
          <a className="logo" href="#">Book Store</a>
          <nav className="main-nav" aria-label="Main Menu">
            <ul id="nav-list">
              <li>
                <Link href="/products">All Books</Link>
              </li>
              <li><a href="#new-arrival">New Arrival</a></li>
              <li><a href="#best-seller">Best Seller</a></li>
              <li><a href="#editors-pick">Editors Pick</a></li>
              <li><a href="#about">About</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </div>
        <section className="hero" aria-label="Latest Books">
          <div className="container hero-grid">
            <div className="hero-copy">
              <p className="eyebrow">Latest Books</p>
              <h1>Your Cybersecurity Knowledge Library</h1>
              <p className="subhead">Build to help you discover What truly matters. Empowering professionals and learners alike</p>
              <a className="btn primary" href="#discover">Discover Now</a>
            </div>
            <div className="hero-slider" role="region" aria-roledescription="carousel" aria-label="Hero Covers">
              <div className="slides">
                <img src="/images/intro.jpg" alt="Hero cover 1" />
                <img src="/images/intro.jpg" alt="Hero cover 1" />
              </div>
            </div>
          </div>
        </section>
      </header>

      <main>
        <section id="discover" className="discover section-pad">
          <div className="container">
            <h2>Discover Your New Book</h2>
            <p className="section-lead">Congue, gravida placeat nibh sunt semper elementum anim Integer lectus debitis auctor.</p>
            <div className="product-grid">
              {/* 8 product cards */}
              <div className="product-card">
                <img src="/images/crypto.jpg" alt="An Introduction to Mathematical Cryptography" />
                <h3>An Introduction to Mathematical Cryptography</h3>
                <div className="price">$18.50</div>
                <button className="btn add-to-cart">Add to cart</button>
              </div>
              <div className="product-card">
                <img src="/images/deception.jpg" alt="The art of deception" />
                <h3>The art of deception</h3>
                <div className="price">$20.00</div>
                <button className="btn add-to-cart">Add to cart</button>
              </div>
              <div className="product-card">
                <img src="/images/dos.jpg" alt="DDoS: Understanding Real-Life Attacks and Mitigation Strategies" />
                <h3>DDoS: Understanding Real-Life Attacks and Mitigation Strategies</h3>
                <div className="price">$17.00</div>
                <button className="btn add-to-cart">Add to cart</button>
              </div>
              <div className="product-card">
                <img src="/images/tcp.jpg" alt="TCP/IP Illustrated, Volume 1" />
                <h3>TCP/IP Illustrated, Volume 1</h3>
                <div className="price">$14.00</div>
                <button className="btn add-to-cart">Add to cart</button>
              </div>
              <div className="product-card">
                <img src="/images/quantum_optics.jpg" alt="Introductory Quantum optics - Second edition" />
                <h3>Introductory Quantum optics - Second edition</h3>
                <div className="price">$20.00</div>
                <button className="btn add-to-cart">Add to cart</button>
              </div>
              <div className="product-card">
                <img src="/images/Hacking-The Art of Exploitation-2nd Edition.jpg" alt="Hacking: The Art of Exploitation, 2nd Edition" />
                <h3>Hacking: The Art of Exploitation, 2nd Edition</h3>
                <div className="price">$21.99</div>
                <button className="btn add-to-cart">Add to cart</button>
              </div>
              <div className="product-card">
                <img src="/images/invisibility.jpg" alt="The Art of Invisibility" />
                <h3>The Art of Invisibility</h3>
                <div className="price">$21.99</div>
                <button className="btn add-to-cart">Add to cart</button>
              </div>
              <div className="product-card">
                <img src="/images/Cult-of-the-dead-cow.jpg" alt="Cult of the Dead Cow: How the Original Hacking Supergroup Might Just Save the World" />
                <h3>Cult of the Dead Cow: How the Original Hacking Supergroup Might Just Save the World</h3>
                <div className="price">$28.00</div>
                <button className="btn add-to-cart">Add to cart</button>
              </div>
            </div>
            <div className="center">
              <Link className="btn outline" href="/products">Discover more books</Link>
            </div>
          </div>
        </section>
        {/* Các section khác copy tương tự, đổi đường dẫn ảnh thành /images/... */}
      </main>
      {/* Footer cũng copy tương tự, đổi các href nội bộ thành Link nếu cần */}
    </>
  );
}