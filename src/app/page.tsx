import NameGradient from "@/components/NameGradient";
import ModelCanvas from "@/components/ModelCanvas";
import TechMarquee from "@/components/TechMarquee";
import ThemeToggle from "@/components/ThemeToggle";
import HomeLatestBlogs from "@/components/HomeLatestBlogs";
import { Separator } from "@/components/ui/separator";

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
          <p className="lg:mt-20 text-base text-muted-foreground">
            I am a Software Engineer based in Dublin currently working as an Intern at{" "}
            <a
              href="https://www.linkedin.com/company/gaddr/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline underline-offset-4"
            >
              Gaddr
            </a>. 
            I have a passion for building tools that empower developers and enhance productivity. I am currently exploring the world of AI and their applications in our daily lives.
          </p>
        </div>
        <div className="flex w-full justify-center lg:w-auto lg:justify-end">
          <ModelCanvas />
        </div>
      </main>
      <TechMarquee />
      <section className="mx-auto w-full max-w-5xl px-6 pb-10 text-foreground">
        {process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST ? (
          <HomeLatestBlogs
            publicationHost={process.env.NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Set `NEXT_PUBLIC_HASHNODE_PUBLICATION_HOST` to load posts.
          </p>
        )}
      </section>
      <div className="mx-auto w-full max-w-5xl px-6 pb-12">
        <Separator className="mt-8 bg-border/70" />
        <div className="mt-6 flex w-full items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Made by Harshit</p>
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
}
