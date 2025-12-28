"use client";

import Image from "next/image";
import styles from "./ProductCard.module.css";
import { useCartStore } from "../store/cart";
import { slugify, formatPrice } from "../lib/utils";
import Link from "next/link";
import { useState } from "react";

export default function ProductCard({ book, onClick }) {
  const addItem = useCartStore((s) => s.addItem);
  const [isAdding, setIsAdding] = useState(false);
  const [showAdded, setShowAdded] = useState(false);

  const price = book.salePrice ?? book.price;
  const originalPrice = book.salePrice ? book.price : null;
  const stock = book.stock ?? 999;
  const inStock = stock > 0;
  const lowStock = stock > 0 && stock <= 5;

  const handleAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!inStock || isAdding) return;

    setIsAdding(true);
    const priceNum = typeof price === 'number' ? price : parseFloat(String(price).replace(/[^\d.]/g, "")) || 0;
    const id = book.slug || slugify(book.title);

    addItem({
      id,
      slug: book.slug || undefined,
      name: book.title,
      image: book.image,
      price: priceNum,
      quantity: 1,
      stock
    });

    setShowAdded(true);
    setTimeout(() => {
      setIsAdding(false);
      setShowAdded(false);
    }, 1500);
  };

  const imgSrc = book.image || "/images/placeholder.jpg";
  const discount = originalPrice && price < originalPrice
    ? Math.round((1 - price / originalPrice) * 100)
    : 0;

  const CardContent = (
    <div className={`${styles.productCard} ${!inStock ? styles.outOfStock : ''}`} onClick={onClick}>
      {/* Badges */}
      <div className={styles.badges}>
        {discount > 0 && (
          <span className={styles.discountBadge}>-{discount}%</span>
        )}
        {lowStock && inStock && (
          <span className={styles.lowStockBadge}>Sắp hết</span>
        )}
        {!inStock && (
          <span className={styles.outOfStockBadge}>Hết hàng</span>
        )}
      </div>

      {/* Image */}
      <div className={styles.imageWrapper}>
        <Image
          src={imgSrc}
          alt={book.title}
          width={200}
          height={280}
          className={styles.productImage}
        />
        {inStock && (
          <button
            className={`${styles.quickAdd} ${showAdded ? styles.added : ''}`}
            onClick={handleAdd}
            disabled={isAdding}
          >
            {showAdded ? '✓ Đã thêm' : '+ Thêm vào giỏ'}
          </button>
        )}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.productTitle}>{book.title}</h3>

        <div className={styles.priceRow}>
          <span className={styles.price}>
            {typeof price === 'number' ? formatPrice(price) : (book.priceDisplay || book.price)}
          </span>
          {originalPrice && (
            <span className={styles.originalPrice}>
              {formatPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Stock indicator */}
        {inStock && (
          <div className={styles.stockInfo}>
            <span className={`${styles.stockDot} ${lowStock ? styles.low : styles.available}`}></span>
            <span className={styles.stockText}>
              {lowStock ? `Chỉ còn ${stock}` : 'Còn hàng'}
            </span>
          </div>
        )}
      </div>
    </div>
  );

  if (book.slug) {
    return <Link href={`/products/${book.slug}`} className={styles.cardLink}>{CardContent}</Link>;
  }
  return CardContent;
}
