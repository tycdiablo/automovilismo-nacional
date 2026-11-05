import { Home, Users, Newspaper, Trophy, CalendarDays, Medal, LayoutGrid, Heart, Shield } from "lucide-react";

export const navigation = [
  { name: "Inicio", href: "/", icon: Home },
  { name: "Calendario", href: "/calendario", icon: CalendarDays },
  { name: "Resultados", href: "/resultados", icon: Trophy },
  { name: "Campeonatos", href: "/campeonatos", icon: Medal },
  { name: "Pilotos", href: "/pilotos", icon: Users },
  { name: "Categorías", href: "/categorias", icon: LayoutGrid },
  { name: "Noticias", href: "/noticias", icon: Newspaper },
];

export const userNavigation = [{ name: "Mis pilotos", href: "/mis-pilotos", icon: Heart }];
export const adminNavigation = [{ name: "Administración", href: "/admin", icon: Shield }];

export function isActivePath(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
