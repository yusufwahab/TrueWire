import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import clsx from "clsx";

const MotionLink = motion.create(Link);

export function Button({ children, to, href, variant = "primary", className, ...props }) {
  const classes = clsx(
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5",
    variant === "primary" && "bg-signal-teal text-white hover:bg-signal-teal/90",
    variant === "secondary" && "border border-slate/30 text-ink hover:border-signal-teal hover:text-signal-teal",
    className,
  );

  // whileTap is a bounded, interaction-only flourish — if it never fires for any reason the
  // element underneath is still a fully functional link/button, unlike a mount/scroll animation
  // that could gate whether content is visible at all.
  if (to) {
    return (
      <MotionLink whileTap={{ scale: 0.98 }} to={to} className={classes} {...props}>
        {children}
      </MotionLink>
    );
  }
  if (href) {
    return (
      <motion.a whileTap={{ scale: 0.98 }} href={href} className={classes} {...props}>
        {children}
      </motion.a>
    );
  }
  return (
    <motion.button whileTap={{ scale: 0.98 }} className={classes} {...props}>
      {children}
    </motion.button>
  );
}
