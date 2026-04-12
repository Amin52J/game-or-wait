"use client";

import React, { useCallback } from "react";
import Link from "next/link";

export interface HashLinkProps
  extends Omit<React.ComponentProps<typeof Link>, "onClick"> {
  children: React.ReactNode;
}

function scrollToHash(hash: string) {
  const el = document.getElementById(hash);
  if (!el) return;

  const main = document.querySelector("main");
  if (main) {
    const elTop = el.getBoundingClientRect().top - main.getBoundingClientRect().top + main.scrollTop;
    main.scrollTo({ top: elTop, behavior: "smooth" });
  } else {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

export function HashLink({ href, children, ...rest }: HashLinkProps) {
  const handleClick = useCallback(() => {
    const hrefStr = typeof href === "string" ? href : href.hash ?? "";
    if (hrefStr.includes("#")) {
      const hash = hrefStr.split("#")[1];
      setTimeout(() => scrollToHash(hash), 300);
    }
  }, [href]);

  return (
    <Link href={href} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
