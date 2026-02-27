import NameGradient from "@/components/NameGradient";
import ModelCanvas from "@/components/ModelCanvas";
import TechMarquee from "@/components/TechMarquee";

export default function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-primary-foreground">
      <main className="mx-auto flex max-w-5xl flex-col-reverse items-center justify-center gap-10 px-6 pb-10 pt-20 lg:flex-row lg:items-start lg:gap-16">
        <div className="flex  w-full my-auto  flex-col items-center gap-2 pt-6 text-center lg:items-start lg:mt-[12%]  lg:pt-4 lg:text-left">
          <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-foreground">
            Hi, I&apos;m
          </p>
          <h1 className="max-w-[12ch] text-5xl font-semibold uppercase tracking-[0.08em] sm:max-w-none sm:text-6xl lg:text-7xl">
            <NameGradient />
          </h1>
          <p className="lg:mt-16 text-base text-muted-foreground">
            I am a Software Engineer based in Dublin
          </p>
        </div>
        <div className="flex w-full justify-center lg:w-auto lg:justify-end">
          <ModelCanvas />
        </div>
      </main>
      <TechMarquee />
    </div>
  );
}
