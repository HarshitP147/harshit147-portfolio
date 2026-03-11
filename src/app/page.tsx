import NameGradient from "@/components/NameGradient";
import ModelCanvasLazy from "@/components/ModelCanvasLazy";
import TechMarquee from "@/components/TechMarquee";
import HomeLatestBlogs from "@/components/HomeLatestBlogs";
import HomeFeaturedProjects from "@/components/HomeFeaturedProjects";
import HomePersonalLinks from "@/components/HomePersonalLinks";
import { sectionShellClassName, sectionTitleClassName } from "@/components/sectionStyles";

export default async function Home() {
  return (
    <div className="min-h-screen bg-background font-sans text-primary-foreground">
      <div className={sectionShellClassName()}>
        <main className="flex flex-col-reverse items-center justify-center gap-10 pb-10 pt-20 xl:flex-row xl:items-start xl:justify-between xl:gap-16">
          <div className="flex w-full my-auto flex-col items-center gap-6 pt-6 text-center xl:items-start xl:pt-4 xl:text-left">
            <div className="xl:-translate-y-24">
              <p className={sectionTitleClassName()}>
                Hi, I&apos;m
              </p>
              <h1 className="max-w-[12em] text-3xl font-light tracking-[0.03em] sm:max-w-none sm:text-7xl xl:text-8xl">
                <NameGradient className="font-geist" />
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
            <ModelCanvasLazy />
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
        <HomePersonalLinks />
      </div>
    </div>
  );
}
