import Image from "next/image";
import ModelCanvas from "@/components/ModelCanvas";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0f0f12] font-sans text-zinc-100">
      <main className="flex min-h-screen w-full max-w-5xl flex-col items-center justify-center gap-10 py-20 px-6 lg:flex-row lg:items-start lg:gap-16">
        <div className="flex w-full flex-col items-center gap-6 text-center lg:items-start lg:text-left">
          <Image
            className="invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <h1 className="max-w-xl text-3xl font-semibold leading-10 tracking-tight text-zinc-100">
            Your 3D model is live on the homepage.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-400">
            Replace the placeholder text, then tweak lighting, camera, and controls
            as needed for your scene.
          </p>
        </div>
        <div className="flex w-full justify-center lg:w-auto lg:justify-end">
          <ModelCanvas />
        </div>
      </main>
    </div>
  );
}
