import Image from "next/image";

import { cn } from "@/lib/utils";

import XBlack from "../../../public/misc/x-logo-black.png";
import XWhite from "../../../public/misc/x-logo-white.png";

type XIconProps = {
  className?: string;
};

export default function XIcon({ className }: XIconProps) {
  return (
    <>
      <Image
        src={XBlack}
        alt=""
        width={32}
        height={32}
        className={cn("block size-full object-contain dark:hidden", className)}
        aria-hidden="true"
      />
      <Image
        src={XWhite}
        alt=""
        width={32}
        height={32}
        className={cn("hidden size-full object-contain dark:inline", className)}
        aria-hidden="true"
      />
    </>
  );
}
