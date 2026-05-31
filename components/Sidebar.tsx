import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  icon?: string;
}

export const NavLink: React.FC<NavLinkProps> = ({ href, children, icon }) => {
  const pathname = usePathname();
  const isActive = pathname !== null && (pathname === href || pathname.startsWith(href + "/"));

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-2 rounded-lg px-4 py-2 transition-colors",
        isActive ? "bg-blue-100 font-medium text-blue-700" : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {children}
    </Link>
  );
};

interface SidebarProps {
  children: React.ReactNode;
}

export const Sidebar: React.FC<SidebarProps> = ({ children }) => {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white md:hidden"
        aria-label="Open app navigation"
      >
        Menu
      </button>

      <aside
        className={cn(
          "fixed left-0 top-0 z-30 h-screen w-64 border-r border-gray-200 bg-white p-6 transition-transform duration-300 md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-blue-600">WasteVerity</h1>
            <button
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 md:hidden"
              aria-label="Close app navigation"
            >
              Close
            </button>
          </div>
          <nav className="space-y-2">{children}</nav>
        </div>
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-20 bg-black bg-opacity-50 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
};
