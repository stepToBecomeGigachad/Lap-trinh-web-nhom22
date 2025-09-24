"use client";

import Image from "next/image";
import styles from "./BestsellerSection.module.css";

export default function BestsellerSection() {
  return (
    <section id="best-seller" className={styles.bestseller}>
      <div className={styles.container}>
        <div className={styles.bestsellerGrid}>
          <div className={styles.bestsellerCopy}>
            <p className={styles.eyebrow}>World's Best Seller</p>
            <h2>The Art of Invisibility</h2>
            <p className={styles.bestsellerDesc}>
              Real-world advice on how to be invisible online from "the FBI's most wanted hacker" (Wired).
              Be online without leaving a trace. Your every step online is being tracked and stored, and your identity literally stolen. 
              Big companies and big governments want to know and exploit what you do, and privacy is a luxury few can afford or understand.
            </p>
            <button className={styles.btnPrimary}>Buy Now</button>
          </div>
          <div className={styles.bestsellerCover}>
            <Image
              src="/images/invisibility.jpg"
              alt="The Art of Invisibility"
              width={300}
              height={400}
              className={styles.bestsellerImage}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
