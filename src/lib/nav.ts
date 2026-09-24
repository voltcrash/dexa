export interface NavItem {
  href: string;
  label: string;
}

export const navItems: NavItem[] = [
  { href: "/", label: "Pokédex" },
  { href: "/types", label: "Types" },
];
