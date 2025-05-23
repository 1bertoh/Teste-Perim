import { Link } from "@heroui/link";
import { useLocation } from "react-router-dom";
import profile from "@/../public/profile.jpg"
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
} from "@heroui/navbar";
import { siteConfig } from "@/config/site";
import { Bell, Leaf } from "lucide-react";

export const Navbar = () => {
  const location = useLocation();

  const isActiveRoute = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
        <NavbarBrand className="gap-3 max-w-fit">
          <Link
            className="flex justify-start items-center gap-1"
            color="foreground"
            href="/"
          >
            <Leaf className="text-[#34b311]" />
            <p className="text-[#34b311] font-bold text-2xl text-inherit">Perim</p>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-4">
          {siteConfig.navItems.map((item, index) => (
            <div key={index} className="relative group">
              <Link
                href={item.href}
                className={`
                  text-sm font-medium leading-normal transition-colors relative block py-2
                  ${isActiveRoute(item.href) 
                    ? 'text-black font-bold' 
                    : 'text-[#374151] hover:text-black hover:-font-bold'
                  }
                `}
              >
                {item.label}
                
                {isActiveRoute(item.href) && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#45e519]"></span>
                )}
                
                {!isActiveRoute(item.href) && (
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#45e519] transition-all duration-300 ease-out group-hover:w-full"></span>
                )}
              </Link>
            </div>
          ))}
        </NavbarItem>
        <NavbarItem className="hidden lg:flex">
          <Bell className="text-[#374151] hover:text-[#45e519] transition-colors cursor-pointer" />
        </NavbarItem>
        <NavbarItem className="hidden md:flex">
          <img
            alt="profile"
            src={profile}
            width={40}
            className="rounded-full cursor-pointer hover:ring-2 hover:ring-[#45e519] transition-all"
          />
        </NavbarItem>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <NavbarMenuToggle />
      </NavbarContent>

      <NavbarMenu>
        <div className="mx-4 mt-2 flex flex-col gap-2">
          {siteConfig.navMenuItems.map((item, index) => (
            <NavbarMenuItem key={`${item}-${index}`}>
              <div className="relative group">
                <Link
                  href={item.href}
                  size="lg"
                  className={`
                    block py-2 transition-colors relative
                    ${isActiveRoute(item.href) 
                      ? 'text-[#45e519] font-bold' 
                      : index === 2
                        ? "text-primary hover:text-[#45e519]"
                        : index === siteConfig.navMenuItems.length - 1
                          ? "text-danger hover:text-[#45e519]"
                          : "text-foreground hover:text-[#45e519]"
                    }
                  `}
                >
                  {item.label}
                  
                  {isActiveRoute(item.href) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#45e519]"></span>
                  )}
                  
                  {!isActiveRoute(item.href) && (
                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#45e519] transition-all duration-300 ease-out group-hover:w-full"></span>
                  )}
                </Link>
              </div>
            </NavbarMenuItem>
          ))}
        </div>
      </NavbarMenu>
    </HeroUINavbar>
  );
};