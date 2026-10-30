import styles from "./Home.module.css";
import { useRouter } from 'next/navigation'

export default function Herosection() {
  const router = useRouter();
  return (
    <main className={styles.home}>
      {/* Headings */}
      <h1 className={styles["heading-primary"]}>
        git commit -m
      </h1>

      <h1 className={styles["heading-secondary"]}>
        "Better Learning"
      </h1>

      {/* Description */}
      <p className={styles.description}>
        Finally, a classroom designed by developers, for developers.
        Real-time monitoring for teachers and an IDE-grade experience
        for students. No setup required.
      </p>

      {/* CTA buttons */}
      <div className={styles["cta-group"]}>
        <button className={`${styles.btn} ${styles.primary}`} onClick={() => router.push("/dashboard")}>
          Create a Classroom
        </button>

        <button className={`${styles.btn} ${styles.secondary}`} onClick={() => router.push("/dashboard")}>
          Join Session
        </button>
      </div>
    </main>
  );
}