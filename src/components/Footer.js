import Link from "next/link";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.footerGrid}>
          <div className={styles.footerCol}>
            <h4>Quick Links</h4>
            <ul>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/products">Books</Link></li>
              <li><Link href="#">Deals</Link></li>
              <li><Link href="#about">About</Link></li>
              <li><Link href="#contact">Contact</Link></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Explore</h4>
            <ul>
              <li><Link href="#best-seller">Bestsellers</Link></li>
              <li><Link href="#">On Sale</Link></li>
              <li><Link href="#editors-pick">Editors Pick</Link></li>
              <li><Link href="#">Best Of 2022</Link></li>
              <li><Link href="#">Featured</Link></li>
            </ul>
          </div>
          <div className={styles.footerCol}>
            <h4>Help</h4>
            <ul>
              <li><Link href="#">Track Order</Link></li>
              <li><Link href="#">Delivery & Returns</Link></li>
              <li><Link href="#">FAQs</Link></li>
              <li><Link href="#">Community</Link></li>
            </ul>
          </div>
        </div>
        <div className={styles.footerBottom}>
          <p>Copyright © 2025 Book Worms | Powered by Book Worms</p>
        </div>
      </div>
    </footer>
  );
}
