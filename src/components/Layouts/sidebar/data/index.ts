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
    label: "服务项目",
    items: [
      {
        title: "驾照申请",
        icon: Icons.FourCircle,
        url: "/feedback",
        items: [],
      },
      {
        title: "医疗证明申请",
        icon: Icons.Calendar,
        url: "/booking",
        items: [],
      },
      {
        title: "退税申请",
        icon: Icons.Table,
        url: "/documents",
        items: [],
      },
    ],
  },
];

const ADMIN_SECTIONS: SidebarSection[] = [
  {
    label: "审核中心",
    items: [
      {
        title: "驾照申请审核",
        icon: Icons.FourCircle,
        url: "/approvals/feedback",
        items: [],
      },
      {
        title: "医疗证明申请审核",
        icon: Icons.Calendar,
        url: "/approvals/booking",
        items: [],
      },
      {
        title: "退税申请审核",
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
