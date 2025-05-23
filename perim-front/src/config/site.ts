export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Perim",
  description: "Sistema Perim",
  navItems: [
    {
      label: "Dashboard",
      href: "/",
    },
    {
      label: "Entregas",
      href: "/entregas",
    },
    {
      label: "Clientes",
      href: "/clientes",
    },
    {
      label: "Entregadores",
      href: "/entregadores",
    },
  ],
  navMenuItems: [
    {
      label: "Dashboard",
      href: "/",
    },
    {
      label: "Entregas",
      href: "/entregas",
    },
    {
      label: "Clientes",
      href: "/clientes",
    },
  ],
};
