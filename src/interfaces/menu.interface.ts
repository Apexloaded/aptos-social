import { LucideProps } from 'lucide-react';

export interface ISectionedMenu {
  title: string;
  menu: MenuOptions[];
}

export interface MenuOptions {
  name: string;
  href: string;
  icon: React.ForwardRefExoticComponent<
    Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
  >;
}
