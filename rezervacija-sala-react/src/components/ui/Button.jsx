import React from "react";

export default function Button({
  children,
  type = "button",
  variant = "primary", // 'primary' | 'ghost' | 'danger'
  fullWidth = false,
  className = "",
  ...props
}) {
  const classes = [
    "btn",
    variant === "primary" && "btn--primary",
    variant === "ghost" && "btn--ghost",
    variant === "danger" && "btn--danger",
    fullWidth && "w-100",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={classes} {...props}>
      {children}
    </button>
  );
}
