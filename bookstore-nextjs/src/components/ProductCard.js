"use client";

import Image from "next/image";
import styles from "./ProductCard.module.css";

export default function ProductCard({ book, onClick }) {
  return (
    <div className={styles.productCard} onClick={onClick}>
      <Image 
        src={book.image} 
        alt={book.title} 
        width={200} 
        height={300}
        className={styles.productImage}
      />
      <h3 className={styles.productTitle}>{book.title}</h3>
      <div className={styles.price}>{book.price}</div>
      <button className={styles.btn}>Add to cart</button>
    </div>
  );
}
