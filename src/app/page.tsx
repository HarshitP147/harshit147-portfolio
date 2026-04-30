import NameGradient from "@/components/NameGradient";
import ModelCanvasLazy from "@/components/ModelCanvasLazy";
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
            <div className="">
              <p className={sectionTitleClassName()}>
                Hi, I{`'`}m
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
              I{`'`}m currently exploring how AI models can be used to integrate into existing applications, how they provide real value to non-technical users, understanding their limitations and exploring concepts that enables an individual to run them on their own hardware.
            </p>
          </div>
          <div className="flex w-full justify-center xl:w-auto xl:justify-end">
            <ModelCanvasLazy />
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
