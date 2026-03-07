import NameGradient from "@/components/NameGradient";
import ModelCanvas from "@/components/ModelCanvas";
import TechMarquee from "@/components/TechMarquee";
import ThemeToggle from "@/components/ThemeToggle";
import HomeLatestBlogs from "@/components/HomeLatestBlogs";
import HomeFeaturedProjects from "@/components/HomeFeaturedProjects";
import { Separator } from "@/components/ui/separator";
import { sectionShellClassName, sectionTitleClassName } from "@/components/sectionStyles";
import { cookies } from "next/headers";

export default async function Home() {
  const cookieStore = await cookies();
  const cookieTheme = cookieStore.get("theme")?.value;
  const initialTheme =
    cookieTheme === "light" || cookieTheme === "dark" ? cookieTheme : undefined;

  return (
    <div className="min-h-screen bg-background font-sans text-primary-foreground">
      <div className={sectionShellClassName()}>
        <main className="flex flex-col-reverse items-center justify-center gap-10 pb-10 pt-20 xl:flex-row xl:items-start xl:justify-between xl:gap-16">
          <div className="flex w-full my-auto flex-col items-center gap-6 pt-6 text-center xl:items-start xl:pt-4 xl:text-left">
            <div className="xl:-translate-y-24">
              <p className={sectionTitleClassName()}>
                Hi, I&apos;m
              </p>
              <h1 className="max-w-[12ch] text-5xl font-semibold uppercase tracking-[0.08em] sm:max-w-none sm:text-6xl xl:text-7xl">
                <NameGradient />
              </h1>
            </div>
            <p className="mx-auto max-w-3xl text-center text-base text-muted-foreground xl:mx-0 xl:text-left">
              I have a Bachelors of Engineering in Computer Engineering from Trinity College Dublin. I have a keen interest in artificial intelligence,  web development and computer graphics.
            </p>
            <p className="mx-auto max-w-3xl text-center text-base text-muted-foreground xl:mx-0 xl:text-left">
              I currently work as a Fullstack Developer Intern at{" "}
              <a
                href="https://www.linkedin.com/company/gaddr/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4"
              >
                Gaddr
              </a>.
        
            </p>
          </div>
          <div className="flex w-full justify-center xl:w-auto xl:justify-end">
            <ModelCanvas />
          </div>
        </main>
        <TechMarquee />
        <section className="pb-10 text-foreground">
          {process.env.NEXT_PUBLIC_HASHNODE_USERNAME ? (
            <HomeLatestBlogs username={process.env.NEXT_PUBLIC_HASHNODE_USERNAME} />
          ) : (
            <p className="text-sm text-muted-foreground">
              Set `NEXT_PUBLIC_HASHNODE_USERNAME` to load posts.
            </p>
          )}
        </section>
        <HomeFeaturedProjects />
        <div className="pb-12">
          <Separator className="mt-8 bg-border/70" />
          <div className="mt-6 flex w-full items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">Made by Harshit</p>
            <ThemeToggle initialTheme={initialTheme} />
          </div>
        </div>
      </div>
    </div>
  );
}
