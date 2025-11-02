import { LoginForm } from "@/components/login-form"
import Image from "next/image"
import localFont from "next/font/local"

const brastine = localFont({
  src: "../fonts/Brastine.woff2",
  display: "swap",
})

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center p-6 md:p-10 relative">
      <Image src="/images/login.png" alt="Maritime background" fill className="object-cover" priority />
      <div className="absolute top-6 left-6 md:top-10 md:left-[8%] flex items-center gap-4 z-10">
        <Image src="/images/Logo1.png" alt="École Maritime Logo" width={80} height={80} className="w-20 h-20 md:w-24 md:h-24" />
        <div className="flex flex-col">
          <span className="text-[#06407F] text-xl md:text-2xl font-bold leading-tight">École Maritime</span>
          <span className="text-[#06407F] text-xl md:text-2xl font-bold leading-tight">Garde Nationale</span>
        </div>
      </div>
      <div className="ml-[8%] relative z-10">
        <h1 className={`${brastine.className} text-white text-4xl md:text-3xl lg:text-4xl font-semibold`}>Former L'élite de la Garde Nationale maritime</h1>
        <h1 className={`${brastine.className} text-white text-4xl md:text-5xl lg:text-7xl font-extrabold pb-5 pt-2`}>Au Service de la Nation</h1>
        <p className="text-white text-lg md:text-xl mt-2 max-w-2xl">
          L'École des Gardes-Côtes forme les cadres et agents des services maritimes. Nos programmes certifiés
          garantissent l'intégration professionnelle au sein de la Garde Nationale.
        </p>
      </div>
      <div className="w-full max-w-sm ml-auto mr-[12.5%] relative z-10">
        <LoginForm />
      </div>
    </div>
  )
}
