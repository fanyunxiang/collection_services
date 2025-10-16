import type { PropsType as IconProps } from "../icons";
import * as Icons from "../icons";

export type SidebarSubItem = {
  title: string;
  url: string;
};

export type SidebarItem = {
  title: string;
  icon: (props: IconProps) => JSX.Element;
  url?: string;
  items: SidebarSubItem[];
};

export type SidebarSection = {
  label: string;
  items: SidebarItem[];
};

function findFirstUrl(sections: SidebarSection[]): string | null {
  for (const section of sections) {
    for (const item of section.items) {
      if (item.url) {
        return item.url;
      }

      const nestedUrl = item.items.find((subItem) => subItem.url)?.url;

      if (nestedUrl) {
        return nestedUrl;
      }
    }
  }

  return null;
}

const USER_SECTIONS: SidebarSection[] = [
  {
    label: "Services",
    items: [
      {
        title: "Driver's License Application",
        icon: Icons.FourCircle,
        url: "/feedback",
        items: [],
      },
      {
        title: "Medical Certificate Application",
        icon: Icons.Calendar,
        url: "/booking",
        items: [],
      },
      {
        title: "Tax Refund Application",
        icon: Icons.Table,
        url: "/documents",
        items: [],
      },
    ],
  },
];

const ADMIN_SECTIONS: SidebarSection[] = [
  {
    label: "Approvals",
    items: [
      {
        title: "Driver's License Reviews",
        icon: Icons.FourCircle,
        url: "/approvals/feedback",
        items: [],
      },
      {
        title: "Medical Certificate Reviews",
        icon: Icons.Calendar,
        url: "/approvals/booking",
        items: [],
      },
      {
        title: "Tax Refund Reviews",
        icon: Icons.Table,
        url: "/approvals/documents",
        items: [],
      },
    ],
  },
];

export function buildSidebarSections(role: "admin" | "user" | null): SidebarSection[] {
  if (role === "admin") {
    return ADMIN_SECTIONS;
  }

  if (role === "user") {
    return USER_SECTIONS;
  }

  return [];
}

export function getDefaultRouteForRole(
  role: "admin" | "user" | null,
): string {
  if (role === "admin") {
    return findFirstUrl(ADMIN_SECTIONS) ?? "/";
  }

  if (role === "user") {
    return findFirstUrl(USER_SECTIONS) ?? "/";
  }

  return "/";
}
