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

        <div className="flex flex-col align-middle items-center md:flex-row gap-16">
          <div className="w-full  ">
            <Image
              src="/misc/me_real_clear.png"
              alt="Harshit sitting behind a laptop and smiling"
              width={300}
              height={100}
              className="rounded-3xl mx-auto md:w-full h-3/5 object-cover  bg-muted/20"
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
