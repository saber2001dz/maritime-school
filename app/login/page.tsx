"use client"
import { LoginForm } from "@/components/login-form"
import Image from "next/image"
import localFont from "next/font/local"
import RevealText from "@/components/ui/RevealText"
import { motion } from "framer-motion"

const brastine = localFont({
  src: "../fonts/Brastine.woff2",
  display: "swap",
})

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center p-6 md:p-10 relative">
      <Image src="/images/login.png" alt="Maritime background" fill className="object-cover" priority />
      <div className="absolute top-6 left-6 md:top-10 md:left-[8%] flex items-center gap-4 z-10">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            duration: 0.6,
            ease: "easeOut"
          }}
        >
          <Image
            src="/images/Logo1.png"
            alt="École Maritime Logo"
            width={80}
            height={80}
            className="w-20 h-20 md:w-24 md:h-24"
          />
        </motion.div>
        <motion.div
          className="flex flex-col"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{
            delay: 0.3,
            duration: 0.6,
            ease: "easeOut"
          }}
        >
          <span className="text-[#06407F] text-xl md:text-2xl font-bold leading-tight">École Maritime</span>
          <span className="text-[#06407F] text-xl md:text-2xl font-bold leading-tight">Garde Nationale</span>
        </motion.div>
      </div>
      <div className="ml-[8%] relative z-10">
        <RevealText className={`${brastine.className} text-white text-4xl md:text-3xl lg:text-4xl font-semibold`}>
          Former L'élite de la Garde Nationale maritime
        </RevealText>
        <RevealText
          direction="left"
          className={`${brastine.className} text-white text-4xl md:text-5xl lg:text-7xl font-extrabold pb-5 pt-2`}
        >
          Au Service de la Nation
        </RevealText>
        <RevealText delay={500} className="text-white text-lg md:text-xl mt-2 max-w-2xl">
          L'École des Gardes-Côtes forme les cadres et agents des services maritimes. Nos programmes certifiés
          garantissent l'intégration professionnelle au sein de la Garde Nationale.
        </RevealText>
      </div>
      <motion.div
        className="w-full max-w-sm ml-auto mr-[12.5%] relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.4,
          duration: 0.7,
          ease: "easeOut"
        }}
      >
        <LoginForm />
      </motion.div>
    </div>
  )
}
