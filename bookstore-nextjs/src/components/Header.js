import Link from "next/link";
import styles from "./Header.module.css";

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.headerTop}>
        <Link href="/" className={styles.logo}>Book Store</Link>
        <nav className={styles.mainNav}>
          <ul>
            <li><Link href="/products">All Books</Link></li>
            <li><Link href="#new-arrival">New Arrival</Link></li>
            <li><Link href="#best-seller">Best Seller</Link></li>
            <li><Link href="#editors-pick">Editors Pick</Link></li>
            <li><Link href="#about">About</Link></li>
            <li><Link href="#contact">Contact</Link></li>
          </ul>
        </nav>
      </div>

      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Latest Books</p>
            <h1>Your Cybersecurity Knowledge Library</h1>
            <p className={styles.subhead}>
              Build to help you discover What truly matters. Empowering professionals and learners alike
            </p>
            <Link href="#discover" className={styles.btnPrimary}>Discover Now</Link>
          </div>
          <div className={styles.heroSlider}>
            <img
              src="/images/intro.jpg"
              alt="Hero cover"
              className={styles.heroImage}
            />
          </div>
        </div>
      </section>
    </header>
  );
}
