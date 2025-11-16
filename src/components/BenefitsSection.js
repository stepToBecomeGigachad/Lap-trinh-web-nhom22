import styles from "./BenefitsSection.module.css";

export default function BenefitsSection() {
  return (
    <section className={styles.benefits}>
      <div className={styles.container}>
        <div className={styles.benefitsGrid}>
          <div className={styles.benefit}>
            <strong>Worldwide Free Shipping</strong>
            <p>Justo vestibulum risus imperdiet consectetur.</p>
          </div>
          <div className={styles.benefit}>
            <strong>Free Returns For All</strong>
            <p>Justo vestibulum risus imperdiet consectetur.</p>
          </div>
          <div className={styles.benefit}>
            <strong>10% Student Discounts</strong>
            <p>Justo vestibulum risus imperdiet consectetur.</p>
          </div>
          <div className={styles.benefit}>
            <strong>Gift Vouchers</strong>
            <p>Justo vestibulum risus imperdiet consectetur.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
