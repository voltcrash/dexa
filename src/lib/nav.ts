export interface NavItem {
  href: string;
  label: string;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Pokédex" },
  { href: "/moves", label: "Moves" },
  { href: "/abilities", label: "Abilities" },
  { href: "/types", label: "Types" },
  { href: "/team", label: "Team builder" },
  { href: "/compare", label: "Compare" },
  { href: "/quiz", label: "Quiz" },
];
