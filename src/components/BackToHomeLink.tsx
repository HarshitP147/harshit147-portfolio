import Link from "next/link";

export default function BackToHomeLink() {
  return (
    <div className="inline-flex">
      <Link
        href="/"
        className="text-sm text-muted-foreground underline-offset-4 transition-colors duration-200 ease-out hover:text-[rgb(59,130,246)] hover:underline"
      >
        Back to Home
      </Link>
    </div>
  );
}
