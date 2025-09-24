"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// Dữ liệu sách
const books = [
  {
    image: "/images/crypto.jpg",
    title: "An Introduction to Mathematical Cryptography",
    price: "$18.50",
    desc: "A comprehensive introduction to modern cryptography, covering the mathematics behind cryptographic protocols and algorithms.",
  },
  {
    image: "/images/deception.jpg",
    title: "The art of deception",
    price: "$20.00",
    desc: "A classic book by Kevin Mitnick about social engineering and the human element in security.",
  },
  {
    image: "/images/dos.jpg",
    title: "DDoS: Understanding Real-Life Attacks and Mitigation Strategies",
    price: "$17.00",
    desc: "Learn about DDoS attacks, real-world examples, and how to defend against them.",
  },
  {
    image: "/images/tcp.jpg",
    title: "TCP/IP Illustrated, Volume 1",
    price: "$14.00",
    desc: "A detailed guide to TCP/IP networking protocols, ideal for students and professionals.",
  },
  {
    image: "/images/quantum_optics.jpg",
    title: "Introductory Quantum optics - Second edition",
    price: "$20.00",
    desc: "An accessible introduction to quantum optics, suitable for beginners and advanced readers.",
  },
  {
    image: "/images/Hacking-The Art of Exploitation-2nd Edition.jpg",
    title: "Hacking: The Art of Exploitation, 2nd Edition",
    price: "$21.99",
    desc: "A hands-on guide to hacking techniques and computer security, with practical examples.",
  },
  {
    image: "/images/invisibility.jpg",
    title: "The Art of Invisibility",
    price: "$21.99",
    desc: "Kevin Mitnick's guide to privacy and anonymity in the digital world.",
  },
  {
    image: "/images/Cult-of-the-dead-cow.jpg",
    title: "Cult of the Dead Cow: How the Original Hacking Supergroup Might Just Save the World",
    price: "$28.00",
    desc: "The story of the legendary hacking group and their impact on cybersecurity.",
  },
];

export default function Products() {
  // State lưu sách đang xem chi tiết
  const [selectedBook, setSelectedBook] = useState(books[0]);

  return (
    <div>
      {/* Header */}
      <header className="site-header" style={{ background: "#f5f5f5", marginBottom: 24 }}>
        <div className="container header-top" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0" }}>
          <Link className="logo" href="/" style={{ fontWeight: "bold", fontSize: 24, textDecoration: "none", color: "#0070f3" }}>Book Store</Link>
          <nav className="main-nav" aria-label="Main Menu">
            <ul id="nav-list" style={{ display: "flex", gap: 16, listStyle: "none", margin: 0, padding: 0 }}>
              <li><Link href="/#all-books">All Books</Link></li>
              <li><Link href="/#new-arrival">New Arrival</Link></li>
              <li><Link href="/#best-seller">Best Seller</Link></li>
              <li><Link href="/#editors-pick">Editors Pick</Link></li>
              <li><Link href="/#about">About</Link></li>
              <li><Link href="/#contact">Contact</Link></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* Main */}
      <main>
        <section className="section-pad" style={{ padding: "32px 0" }}>
          <div className="container" style={{ maxWidth: 1100, margin: "0 auto" }}>
            <h1 style={{ marginBottom: 24 }}>Book Details</h1>
            <div className="product-detail-grid" style={{
              display: "flex",
              gap: "2rem",
              alignItems: "flex-start",
              marginBottom: "2rem",
              flexWrap: "wrap"
            }}>
              <div className="product-detail-image">
                <Image
                  src={selectedBook.image}
                  alt={selectedBook.title}
                  width={220}
                  height={320}
                  style={{
                    objectFit: "cover",
                    borderRadius: 8,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
                  }}
                />
              </div>
              <div className="product-detail-info" style={{ flex: 1, minWidth: 250 }}>
                <h2>{selectedBook.title}</h2>
                <div className="price" style={{ fontWeight: "bold", color: "#0070f3", marginBottom: 8 }}>{selectedBook.price}</div>
                <p>{selectedBook.desc}</p>
                <button className="btn primary" style={{
                  padding: "10px 24px",
                  background: "#0070f3",
                  color: "#fff",
                  border: "none",
                  borderRadius: 4,
                  cursor: "pointer",
                  marginTop: 16
                }}>
                  Add to cart
                </button>
              </div>
            </div>
            <hr />
            <h3 style={{ margin: "32px 0 16px" }}>Other Books</h3>
            <div className="product-grid four" style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "24px"
            }}>
              {books.map((book, idx) => (
                <div
                  key={book.title}
                  className="product-card"
                  style={{
                    border: "1px solid #eee",
                    borderRadius: 8,
                    padding: 16,
                    cursor: "pointer",
                    transition: "box-shadow 0.2s",
                    boxShadow: selectedBook.title === book.title ? "0 4px 16px rgba(0,112,243,0.08)" : "none"
                  }}
                  onClick={() => {
                    setSelectedBook(book);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                >
                  <Image
                    src={book.image}
                    alt={book.title}
                    width={220}
                    height={140}
                    style={{
                      objectFit: "cover",
                      borderRadius: 6,
                      marginBottom: 12
                    }}
                  />
                  <h3 style={{ fontSize: 18, margin: "8px 0" }}>{book.title}</h3>
                  <div className="price" style={{ color: "#0070f3", fontWeight: "bold" }}>{book.price}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="site-footer" style={{ background: "#f5f5f5", marginTop: 48 }}>
        <div className="container footer-grid" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 24,
          padding: "32px 0"
        }}>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li><Link href="/">Home</Link></li>
              <li><Link href="/#all-books">Books</Link></li>
              <li><Link href="#">Deals</Link></li>
              <li><Link href="/#about">About</Link></li>
              <li><Link href="/#contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Explore</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li><Link href="/#best-seller">Bestsellers</Link></li>
              <li><Link href="#">On Sale</Link></li>
              <li><Link href="/#editors-pick">Editors Pick</Link></li>
              <li><Link href="#">Best Of 2022</Link></li>
              <li><Link href="#">Featured</Link></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <ul style={{ listStyle: "none", padding: 0 }}>
              <li><Link href="#">Track Order</Link></li>
              <li><Link href="#">Delivery & Returns</Link></li>
              <li><Link href="#">FAQs</Link></li>
              <li><Link href="#">Community</Link></li>
            </ul>
          </div>
        </div>
        <div className="container footer-bottom" style={{ textAlign: "center", padding: "16px 0", fontSize: 14 }}>
          <p>Copyright © 2025 Book Worms | Powered by Book Worms</p>
        </div>
      </footer>
    </div>
  );
}