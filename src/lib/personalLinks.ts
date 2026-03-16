export type PersonalLinkPlatform = "linkedin" | "github" | "x" | "instagram" | "email";

export type PersonalLink = {
  platform: PersonalLinkPlatform;
  label: string;
  href: string;
  ariaLabel: string;
};

export const personalLinks: PersonalLink[] = [
  {
    platform: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/harshitpandit7/",
    ariaLabel: "Open Harshit Pandit's LinkedIn profile",
  },
  {
    platform: "github",
    label: "GitHub",
    href: "https://github.com/HarshitP147",
    ariaLabel: "Open Harshit Pandit's GitHub profile",
  },
  {
    platform: "x",
    label: "X / Twitter",
    href: "https://x.com/Harshit77406528",
    ariaLabel: "Open Harshit Pandit's X profile",
  },
  {
    platform: "instagram",
    label: "Instagram",
    href: "https://www.instagram.com/harshit._147/",
    ariaLabel: "Open Harshit Pandit on Instagram",
  },
  {
    platform: "email",
    label: "Email",
    href: "mailto:harshit7757@gmail.com",
    ariaLabel: "Send an email to Harshit Pandit",
  },
];
