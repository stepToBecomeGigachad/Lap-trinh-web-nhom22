"use client";

import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import BestsellerSection from "../components/BestsellerSection";
import BenefitsSection from "../components/BenefitsSection";
import styles from "./page.module.css";

// Dữ liệu sách
const books = [
  {
    image: "/images/crypto.jpg",
    title: "An Introduction to Mathematical Cryptography",
    price: "$18.50",
    desc: "A comprehensive introduction to modern cryptography, covering the mathematics behind cryptographic protocols and algorithms."
  },
  {
    image: "/images/deception.jpg",
    title: "The art of deception",
    price: "$20.00",
    desc: "A classic book by Kevin Mitnick about social engineering and the human element in security."
  },
  {
    image: "/images/dos.jpg",
    title: "DDoS: Understanding Real-Life Attacks and Mitigation Strategies",
    price: "$17.00",
    desc: "Learn about DDoS attacks, real-world examples, and how to defend against them."
  },
  {
    image: "/images/tcp.jpg",
    title: "TCP/IP Illustrated, Volume 1",
    price: "$14.00",
    desc: "A detailed guide to TCP/IP networking protocols, ideal for students and professionals."
  }
];

export default function Home() {
  return (
    <div>
      <Header />

      <main>
        <section id="discover" className={styles.discover}>
          <div className={styles.container}>
            <h2>Discover Your New Book</h2>
            <p className={styles.sectionLead}>
              Cybersecurity is no longer optional — it’s essential.<br />
              From beginner guides to expert insights, the right book can unlock knowledge and protect your digital world.
            </p>
            <div className={styles.productGrid}>
              {books.map((book, index) => (
                <ProductCard 
                  key={index} 
                  book={book} 
                  onClick={() => console.log('Book clicked:', book.title)}
                />
              ))}
            </div>
            <div className={styles.center}>
              <Link href="#all-books" className={styles.btnOutline}>Discover more books</Link>
            </div>
          </div>
        </section>

        <section id="categories" className={styles.categories}>
          <div className={styles.container}>
            <h2>Choose By Category</h2>
            <div className={styles.categoryGrid}>
              <Link href="#" className={styles.category}>Reverse Engineering</Link>
              <Link href="#" className={styles.category}>PWN</Link>
              <Link href="#" className={styles.category}>Cryptography</Link>
              <Link href="#" className={styles.category}>Web</Link>
              <Link href="#" className={styles.category}>Network</Link>
              <Link href="#" className={styles.category}>Forensics</Link>
            </div>
            <div className={styles.center}>
              <Link href="#" className={styles.btnOutline}>See all categories</Link>
            </div>
          </div>
        </section>

        <BestsellerSection />
        <BenefitsSection />
      </main>

      <Footer />
    </div>
  );
}
