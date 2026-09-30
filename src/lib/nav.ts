export interface NavItem {
  href: string;
  label: string;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Pokédex" },
  { href: "/atlas", label: "Atlas" },
  { href: "/moves", label: "Moves" },
  { href: "/abilities", label: "Abilities" },
  { href: "/types", label: "Types" },
  { href: "/team", label: "Team builder" },
  { href: "/compare", label: "Compare" },
  { href: "/daily", label: "Daily" },
  { href: "/quiz", label: "Quiz" },
];
