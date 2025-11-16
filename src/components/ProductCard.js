"use client";

import Image from "next/image";
import styles from "./ProductCard.module.css";
import { useCartStore } from "../store/cart";
import { slugify } from "../lib/utils";
import Link from "next/link";

export default function ProductCard({ book, onClick }) {
  const addItem = useCartStore((s) => s.addItem);
  const handleAdd = (e) => {
    e.stopPropagation();
    const price = parseFloat(String(book.price).replace(/[^\d.]/g, "")) || 0;
    const id = book.slug || slugify(book.title);
    addItem({
      id,
      slug: book.slug || undefined,
      name: book.title,
      image: book.image,
      price,
      quantity: 1,
    });
  };
  const imgSrc = book.image || "/images/publisher-image.png";
  const content = (
    <div className={styles.productCard} onClick={onClick}>
      <Image 
        src={imgSrc} 
        alt={book.title} 
        width={200} 
        height={300}
        className={styles.productImage}
      />
      <h3 className={styles.productTitle}>{book.title}</h3>
      <div className={styles.price}>{book.priceDisplay || book.price}</div>
      <button className={styles.btn} onClick={handleAdd}>Add to cart</button>
    </div>
  );
  if (book.slug) {
    return <Link href={`/products/${book.slug}`}>{content}</Link>;
  }
  return content;
}
