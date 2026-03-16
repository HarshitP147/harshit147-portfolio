import Image from "next/image";
import { sectionTitleClassName } from "@/components/sectionStyles";
import SocialLinksDock from "@/components/SocialLinksDock";
import SocialLinksStack from "@/components/SocialLinksStack";
import { personalLinks } from "@/lib/personalLinks";

export default function HomePersonalLinks() {
  return (
    <section className="py-12 text-foreground">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center xl:items-start xl:text-left">
          <h2 className={sectionTitleClassName("text-xl")}>Socials</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
            My online presence where you can find me. Feel free to connect!
          </p>
        </div>

        <div className="flex flex-col items-center gap-16 sm:flex-row sm:items-stretch sm:h-[360px]">
          <div className="flex w-full items-center justify-center  sm:w-[95%]   sm:h-full">
            <Image
              src="/misc/harshit-image.jpeg"
              alt="Harshit sitting behind a laptop"
              width={300}
              height={400}
              sizes="(max-width: 768px) 70vw, 320px"
              className="h-full w-auto max-w-[320px] rounded-3xl bg-muted/20 object-cover shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
              loading="lazy"
              decoding="async"
              fetchPriority="low"
              priority={false}
            />
          </div>
          <SocialLinksStack links={personalLinks} />
        </div>
        <SocialLinksDock links={personalLinks} />
      </div>
    </section>
  );
}
