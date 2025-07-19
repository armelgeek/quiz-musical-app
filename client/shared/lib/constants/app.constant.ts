import '@/features/admin-entities';
import { Icons } from "@/shared/components/atoms/ui/icons";
import { getRegisteredAdminEntities } from '@/shared/lib/admin/admin-generator';

const kAppName = "Boiler"
const kAppAbbr = "TA";
const kAppTagline = "Système d'administration ultra-simplifié";
const kAppDescription = `Boiler est une plateforme d'administration moderne qui permet de gérer facilement vos contenus, utilisateurs et paramètres avec des interfaces CRUD générées automatiquement.`;

export interface NavItem {
  title: string;
  url: string;
  disabled?: boolean;
  external?: boolean;
  shortcut?: [string, string];
  icon?: keyof typeof Icons;
  label?: string;
  description?: string;
  isActive?: boolean;
  items?: NavItem[];
}

export interface NavItemWithChildren extends NavItem {
  items: NavItemWithChildren[];
}

export interface NavItemWithOptionalChildren extends NavItem {
  items?: NavItemWithChildren[];
}

export interface FooterItem {
  title: string;
  items: {
    title: string;
    href: string;
    external?: boolean;
  }[];
}

export type MainNavItem = NavItemWithOptionalChildren;

export type SidebarNavItem = NavItemWithChildren;

export const CLIENT_MENU_ITEMS: NavItem[] = [
  {
    title: "Accueil",
    url: "/",
  }
];

export function getSidebarNavItems(): NavItem[] {
  return getRegisteredAdminEntities()
    .slice()
    .sort((a, b) => (a.menuOrder ?? 999) - (b.menuOrder ?? 999))
    .map(entity => {
      const config = entity.config as { title?: string; description?: string; icon?: string };
      // Si l'icône est un emoji, on le met dans label, sinon dans icon (clé Icons)
      const isEmoji = typeof config.icon === 'string' && config.icon.length <= 3;
      return {
        title: config.title || entity.path,
        url: entity.href,
        icon: !isEmoji ? (config.icon as keyof typeof Icons) : undefined,
        label: isEmoji ? config.icon : undefined,
        description: config.description,
        items: [],
      };
    });
}

export { kAppName, kAppAbbr, kAppTagline, kAppDescription };
