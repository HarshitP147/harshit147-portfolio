import Image from "next/image";
import ModelCanvas from "@/components/ModelCanvas";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-5xl flex-col items-center justify-between gap-12 py-20 px-6 bg-white dark:bg-black sm:items-start">
        <div className="w-full">
          <ModelCanvas />
        </div>
        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <Image
            className="dark:invert"
            src="/next.svg"
            alt="Next.js logo"
            width={100}
            height={20}
            priority
          />
          <h1 className="max-w-xl text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            Your 3D model is live on the homepage.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Replace the placeholder text, then tweak lighting, camera, and controls
            as needed for your scene.
          </p>
        </div>
      </main>
    </div>
  );
}
