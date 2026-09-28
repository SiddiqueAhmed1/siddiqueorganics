"use client";

import { useEffect } from "react";

// Ref-counted body scroll lock. The product modal and the cart drawer
// can both request a lock; the page only unlocks when the LAST one
// releases, so they never fight over document.body.style.
let lockCount = 0;
let saved = { bodyOverflow: "", htmlOverflow: "", paddingRight: "" };

function lock() {
  if (lockCount++ > 0) return;
  const body = document.body;
  const html = document.documentElement;
  saved = {
    bodyOverflow: body.style.overflow,
    htmlOverflow: html.style.overflow,
    paddingRight: body.style.paddingRight,
  };
  // Compensate for the vanishing scrollbar so the layout doesn't jump.
  const scrollbar = window.innerWidth - html.clientWidth;
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;
  body.style.overflow = "hidden";
  html.style.overflow = "hidden";
}

function unlock() {
  if (lockCount === 0 || --lockCount > 0) return;
  document.body.style.overflow = saved.bodyOverflow;
  document.documentElement.style.overflow = saved.htmlOverflow;
  document.body.style.paddingRight = saved.paddingRight;
}

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    lock();
    return unlock;
  }, [active]);
}
