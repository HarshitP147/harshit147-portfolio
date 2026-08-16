import NameGradient from "@/components/NameGradient";
import ModelCanvasLazy from "@/components/ModelCanvasLazy";
import TechMarquee from "@/components/TechMarquee";
import { Suspense } from "react";
import HomeLatestBlogs, { HomeLatestBlogsSkeleton } from "@/components/HomeLatestBlogs";
import HomeFeaturedProjects from "@/components/HomeFeaturedProjects";
import HomePersonalLinks from "@/components/HomePersonalLinks";
import { sectionShellClassName, sectionTitleClassName } from "@/components/sectionStyles";


export default async function Home() {
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
                <NameGradient />
              </h1>
            </div>
            <p className="mx-auto max-w-3xl text-center text-base text-muted-foreground xl:mx-0 xl:text-left">
              I am a software engineer in AI based in Dublin, Ireland. I got my Bachelors in Computer Engineering from Trinity College Dublin in 2025.
            </p>
            <p className="mx-auto max-w-3xl text-center text-base text-muted-foreground xl:mx-0 xl:text-left">
              I have a serious interest in artificial intelligence, web developments, GPU hardware and machine learning systems. I'm actively building skills to specialize in Machine learning systems and AI Inference.
            </p>
            <p className="mx-auto max-w-3xl text-center text-base text-muted-foreground xl:mx-0 xl:text-left">
              I{`'`}m currently exploring deep into the field of AI, by understanding the mathematics, the compute infrastructure, engineering trade-offs, business and economics and how they can be used to make an impact in the world. 
            </p>
          </div>
          <div className="flex w-full justify-center xl:w-auto xl:justify-end">
            <ModelCanvasLazy />
          </div>
        </main>
        <TechMarquee />
        <section className="pb-10 text-foreground">
          <Suspense fallback={<HomeLatestBlogsSkeleton />}>
            <HomeLatestBlogs />
          </Suspense>
        </section>
        <HomeFeaturedProjects />
        <HomePersonalLinks />
      </div>
    </div>
  );
}
