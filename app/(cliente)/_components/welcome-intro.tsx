"use client";

import { motion, useReducedMotion } from "framer-motion";

const ease = [0.16, 1, 0.3, 1] as const;

export function WelcomeIntro() {
  const reduceMotion = useReducedMotion();

  return (
    <div style={{ marginTop: "auto", marginBottom: 28 }}>
      <motion.div
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: {
            transition: {
              staggerChildren: reduceMotion ? 0 : 0.34,
              delayChildren: reduceMotion ? 0 : 0.24,
            },
          },
        }}
        style={{ display: "grid", gap: 16 }}
      >
        <motion.div
          className="cp-display"
          variants={{
            hidden: {
              opacity: 0,
                y: reduceMotion ? 0 : -30,
            },
            show: {
              opacity: 1,
              y: 0,
              transition: {
                duration: reduceMotion ? 0 : 1.45,
                ease,
              },
            },
          }}
          style={{
            fontSize: 46,
            lineHeight: 1.02,
            color: "var(--cp-ink)",
            textWrap: "balance",
            willChange: "transform, opacity",
          }}
        >
          Sé el más
          <br />
          chulo de la playa.
        </motion.div>

        <motion.p
          variants={{
            hidden: {
              opacity: 0,
                y: reduceMotion ? 0 : 18,
            },
            show: {
              opacity: 1,
              y: 0,
              transition: {
                duration: reduceMotion ? 0 : 1.08,
                ease,
              },
            },
          }}
          style={{
            fontSize: 16.5,
            lineHeight: 1.45,
            color: "var(--cp-ink-soft)",
            maxWidth: 290,
            willChange: "transform, opacity",
          }}
        >
          Pide hamacas, sombrillas y sillas desde tu sitio. Te lo llevamos a
          la arena en minutos.
        </motion.p>
      </motion.div>
    </div>
  );
}
