"use client";

import { cn } from "@/lib/utils";
import { Link, LinkProps } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href: string;
  icon: React.JSX.Element | React.ReactNode;
}

interface SidebarContextProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  animate: boolean;
}

const SidebarContext = createContext<SidebarContextProps | undefined>(
  undefined
);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({
  children,
  open: openProp,
  setOpen: setOpenProp,
  animate = true,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  const [openState, setOpenState] = useState(false);

  const open = openProp !== undefined ? openProp : openState;
  const setOpen = setOpenProp !== undefined ? setOpenProp : setOpenState;

  return (
    <SidebarContext.Provider value={{ open, setOpen, animate }}>
      {children}
    </SidebarContext.Provider>
  );
};

export const Sidebar = ({
  children,
  open,
  setOpen,
  animate,
}: {
  children: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  animate?: boolean;
}) => {
  return (
    <SidebarProvider open={open} setOpen={setOpen} animate={animate}>
      {children}
    </SidebarProvider>
  );
};

export const SidebarBody = (props: React.ComponentProps<typeof motion.div>) => {
  return (
    <>
      <DesktopSidebar {...props} />
      <MobileSidebar {...(props as React.ComponentProps<"div">)} />
    </>
  );
};

export const DesktopSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<typeof motion.div>) => {
  const { open, setOpen, animate } = useSidebar();
  return (
    <motion.div
      className={cn(
        "sticky top-0 h-screen px-4 py-6 hidden md:flex md:flex-col bg-[#181a2f] border-r border-[#2a2d4a] w-[260px] flex-shrink-0 z-30 shadow-2xl backdrop-blur-xl overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
        className
      )}
      animate={{
        width: animate ? (open ? "260px" : "68px") : "260px",
      }}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const MobileSidebar = ({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) => {
  const { open, setOpen } = useSidebar();
  return (
    <>
      <div
        className={cn(
          "h-12 px-4 flex flex-row md:hidden items-center justify-between bg-[#181a2f] border-b border-[#2a2d4a] w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-slate-200 hover:text-white cursor-pointer"
            onClick={() => setOpen(!open)}
          />
        </div>
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ x: "-100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "-100%", opacity: 0 }}
              transition={{
                duration: 0.3,
                ease: "easeInOut",
              }}
              className={cn(
                "fixed h-full w-full inset-0 bg-[#0f1020] border-r border-[#2a2d4a] p-6 z-[100] flex flex-col justify-between overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                className
              )}
            >
              <div
                className="absolute right-6 top-6 z-50 text-slate-300 hover:text-white cursor-pointer"
                onClick={() => setOpen(!open)}
              >
                <X />
              </div>
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export const SidebarText = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { open, animate } = useSidebar();
  return (
    <motion.span
      animate={{
        display: animate ? (open ? "inline-block" : "none") : "inline-block",
        opacity: animate ? (open ? 1 : 0) : 1,
      }}
      className={className}
    >
      {children}
    </motion.span>
  );
};

export const SidebarLink = ({
  link,
  className,
  ...props
}: {
  link: Links;
  className?: string;
  props?: LinkProps;
}) => {
  const { open, animate } = useSidebar();
  return (
    <Link
      to={link.href}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-2.5 px-2 rounded-lg hover:bg-[#252848] transition-colors",
        className
      )}
      {...props}
    >
      {link.icon}
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-slate-300 group-hover/sidebar:text-white text-sm font-medium group-hover/sidebar:translate-x-1 transition-all duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </Link>
  );
};

export const SidebarHistoryItem = ({
  title,
  isActive,
  onClick,
}: {
  title: string;
  isActive?: boolean;
  onClick?: () => void;
}) => {
  const { open, animate } = useSidebar();
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left flex items-center justify-start gap-2.5 py-2 px-2.5 rounded-lg text-xs transition-colors truncate cursor-pointer",
        isActive
          ? "bg-indigo-600/30 text-indigo-200 font-medium border border-indigo-500/30"
          : "text-slate-400 hover:text-slate-200 hover:bg-[#252848]"
      )}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
      <motion.span
        animate={{
          display: animate ? (open ? "inline-block" : "none") : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="truncate whitespace-pre"
      >
        {title}
      </motion.span>
    </button>
  );
};
