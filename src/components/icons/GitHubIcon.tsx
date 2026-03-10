import Image from "next/image";

type GitHubIconProps = {
  className?: string;
};

export default function GitHubIcon({ className }: GitHubIconProps) {
  return (
    <Image
      src="/misc/GitHub_Invertocat_Black.svg"
      alt=""
      width={32}
      height={32}
      className={className}
      unoptimized
      aria-hidden="true"
    />
  );
}
