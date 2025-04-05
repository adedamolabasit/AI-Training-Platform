"use client";

import { Brain } from "lucide-react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  DynamicContextProvider,
  DynamicWidget,
} from "@dynamic-labs/sdk-react-core";


const Navbar = () => {
  const pathname = usePathname();

  const routes = [
    {
      href: "/dashboard/contributor",
      label: "DataSet Contributors",
      active: pathname === "/dashboard/contributor",
    },
    {
      href: "/dashboard/trainer",
      label: "AI Trainers",
      active: pathname === "/dashboard/trainer",
    },
    {
      href: "/verify",
      label: "Verification",
      active: pathname === "/verify",
    },
  ];

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4 max-w-7xl mx-auto">
        <Link href="/">
          <div className="flex items-center gap-x-2">
            <Brain className="h-8 w-8" />
            <span className="text-xl font-bold">AI Training Platform</span>
          </div>
        </Link>
        <nav className="flex items-center space-x-6 lg:space-x-8 mx-6">
          {routes.map((route) => (
            <Button
              key={route.href}
              asChild
              variant={route.active ? "default" : "ghost"}
            >
              <Link
                href={route.href}
                className="text-sm font-medium transition-colors"
              >
                {route.label}
              </Link>
            </Button>
          ))}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <ModeToggle />
          <DynamicWidget />
          {/* <ConnectButton /> */}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
