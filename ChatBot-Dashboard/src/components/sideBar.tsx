"use client";

import { cn } from "@/lib/utils";
import { Link, LinkProps } from "react-router-dom";
import React, { useState, createContext, useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";

interface Links {
  label: string;
  href?: string;
  icon: React.JSX.Element | React.ReactNode;
  onClick?: () => void;
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
        "sticky top-0 h-screen px-4 py-6 hidden md:flex md:flex-col bg-[var(--card)] border-r border-[var(--border)] w-[260px] flex-shrink-0 z-30 shadow-2xl backdrop-blur-xl overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
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
          "h-12 px-4 flex flex-row md:hidden items-center justify-between bg-[var(--card)] border-b border-[var(--border)] w-full"
        )}
        {...props}
      >
        <div className="flex justify-end z-20 w-full">
          <Menu
            className="text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
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
                "fixed h-full w-full inset-0 bg-[var(--bg)] border-r border-[var(--border)] p-6 z-[100] flex flex-col justify-between overflow-x-hidden overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]",
                className
              )}
            >
              <div
                className="absolute right-6 top-6 z-50 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
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

  const content = (
    <>
      {link.icon}

      <motion.span
        animate={{
          display: animate
            ? open
              ? "inline-block"
              : "none"
            : "inline-block",
          opacity: animate ? (open ? 1 : 0) : 1,
        }}
        className="text-[var(--muted)] group-hover/sidebar:text-[var(--text)] text-sm font-medium group-hover/sidebar:translate-x-1 transition-all duration-150 whitespace-pre inline-block !p-0 !m-0"
      >
        {link.label}
      </motion.span>
    </>
  );

  // If onClick exists, behave like a button instead of navigating
  if (link.onClick) {
    return (
      <button
        type="button"
        onClick={link.onClick}
        className={cn(
          "w-full flex items-center justify-start gap-3 group/sidebar py-2.5 px-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors text-left",
          className
        )}
        {...props}
      >
        {content}
      </button>
    );
  }

  // Otherwise behave normally as a navigation link
  return (
    <Link
      to={link.href || "#"}
      className={cn(
        "flex items-center justify-start gap-3 group/sidebar py-2.5 px-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors",
        className
      )}
      {...props}
    >
      {content}
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
          ? "bg-[rgba(249,115,22,0.15)] text-[var(--primary)] font-medium border border-[var(--primary)]"
          : "text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--card-hover)]"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", isActive ? "bg-[var(--primary)]" : "bg-[var(--border-hover)]")} />
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
