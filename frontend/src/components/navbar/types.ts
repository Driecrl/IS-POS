export interface NavbarProps {
  activePath: string;
}

export interface NavLink {
  label: string;
  href: string;
  adminOnly?: boolean;
}

export interface NavGroup {
  title: string;
  links: NavLink[];
}