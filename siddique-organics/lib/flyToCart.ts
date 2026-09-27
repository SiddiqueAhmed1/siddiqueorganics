"use client";

// Purely visual "fly to cart" effect. It never touches cart state —
// call addToCart() separately (and unconditionally) so the cart is
// always correct even when this animation is skipped or fails.
//
// How it targets the cart: FloatingCart renders its root button with
// id="floating-cart-target". We look that up at click time so this
// file has zero coupling to where the cart icon lives on the page.

const CART_TARGET_ID = "floating-cart-target";

export function flyToCart(sourceEl: Element | null, imageSrc?: string | null) {
  if (typeof window === "undefined" || !sourceEl) return;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const cartTarget = document.getElementById(CART_TARGET_ID);
  if (prefersReducedMotion || !cartTarget) return;

  const startRect = sourceEl.getBoundingClientRect();
  const endRect = cartTarget.getBoundingClientRect();
  const size = Math.min(startRect.width, startRect.height, 90);

  const flyer = document.createElement(imageSrc ? "img" : "div");
  if (imageSrc && flyer instanceof HTMLImageElement) {
    flyer.src = imageSrc;
    flyer.style.objectFit = "cover";
  } else {
    flyer.style.background = "#3B7A42";
  }

  Object.assign(flyer.style, {
    position: "fixed",
    left: `${startRect.left + startRect.width / 2 - size / 2}px`,
    top: `${startRect.top + startRect.height / 2 - size / 2}px`,
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: "9999px",
    boxShadow: "0 6px 18px rgba(14, 58, 36, 0.35)",
    border: "2px solid #ffffff",
    zIndex: "9999",
    pointerEvents: "none",
    transition:
      "transform 700ms cubic-bezier(0.55, -0.4, 0.3, 1.4), opacity 700ms ease-in",
    willChange: "transform, opacity",
  });

  document.body.appendChild(flyer);

  const startCenterX = startRect.left + startRect.width / 2;
  const startCenterY = startRect.top + startRect.height / 2;
  const endCenterX = endRect.left + endRect.width / 2;
  const endCenterY = endRect.top + endRect.height / 2;

  const deltaX = endCenterX - startCenterX;
  const deltaY = endCenterY - startCenterY;

  // Force a reflow so the browser registers the starting position
  // before we change the transform — otherwise it can skip straight
  // to the end state with no transition.
  void flyer.getBoundingClientRect();

  requestAnimationFrame(() => {
    flyer.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.1)`;
    flyer.style.opacity = "0.35";
  });

  let cleaned = false;
  const cleanup = () => {
    if (cleaned) return;
    cleaned = true;
    flyer.remove();
  };

  flyer.addEventListener("transitionend", cleanup, { once: true });
  // Safety net — some browsers can skip transitionend if the tab
  // was backgrounded mid-animation.
  setTimeout(cleanup, 850);
}
