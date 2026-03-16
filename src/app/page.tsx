import NameGradient from "@/components/NameGradient";
import ModelCanvas from "@/components/ModelCanvas";
import TechMarquee from "@/components/TechMarquee";
import { Suspense } from "react";
import HomeLatestBlogs, { HomeLatestBlogsSkeleton } from "@/components/HomeLatestBlogs";
import HomeFeaturedProjects from "@/components/HomeFeaturedProjects";
import HomePersonalLinks from "@/components/HomePersonalLinks";
import { sectionShellClassName, sectionTitleClassName } from "@/components/sectionStyles";

export default async function Home() {
  const username =
    process.env.HASHNODE_USERNAME ??
    process.env.NEXT_PUBLIC_HASHNODE_USERNAME ??
    null;

  return (
    <div className="min-h-screen bg-background font-sans text-primary-foreground">
      <div className={sectionShellClassName()}>
        <main className="flex flex-col-reverse items-center justify-center gap-10 pb-10 pt-20 xl:flex-row xl:items-start xl:justify-between xl:gap-16">
          <div className="flex w-full my-auto flex-col items-center gap-6 pt-6 text-center xl:items-start xl:pt-4 xl:text-left">
            <div className="xl:-translate-y-22">
              <p className={sectionTitleClassName()}>
                Hi, I&apos;m
              </p>
              <h1 className="max-w-[12em] text-4xl font-semibold tracking-[0.03em] sm:max-w-none sm:text-7xl sm:font-light xl:text-8xl">
                <NameGradient className="font-geist" />
              </h1>
            </div>
            <p className="mx-auto max-w-3xl text-center text-base text-muted-foreground xl:mx-0 xl:text-left">
              I am a software engineer based in Dublin, Ireland. I have a passion for building applications that make an impact.
            </p>
            <p className="mx-auto max-w-3xl text-center text-base text-muted-foreground xl:mx-0 xl:text-left">
              I completed my Bachelors in Computer Engineering from Trinity College Dublin in 2025. I have a keen interest in artificial intelligence,  web development and computer graphics.
            </p>
            <p className="mx-auto max-w-3xl text-center text-base text-muted-foreground xl:mx-0 xl:text-left">
              I work as an Intern at{" "}
              <a
                href="https://www.linkedin.com/company/gaddr/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline underline-offset-4"
              >
                Gaddr
              </a>.
              I'm currently exploring how AI models can be trained and deployed locally on edge devices, and how they can be used to build useful applications while preserving user privacy.
            </p>
          </div>
          <div className="flex w-full justify-center xl:w-auto xl:justify-end">
            <ModelCanvas />
          </div>
        </main>
        <TechMarquee />
        <section className="pb-10 text-foreground">
          {username ? (
            <Suspense fallback={<HomeLatestBlogsSkeleton />}>
              <HomeLatestBlogs username={username} />
            </Suspense>
          ) : (
            <p className="text-sm text-muted-foreground">
              Set `HASHNODE_USERNAME` (or `NEXT_PUBLIC_HASHNODE_USERNAME`) to load posts.
            </p>
          )}
        </section>
        <HomeFeaturedProjects />
        <HomePersonalLinks />
      </div>
    </div>
  );
}
