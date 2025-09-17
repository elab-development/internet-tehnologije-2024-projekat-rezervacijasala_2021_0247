import React from "react";

export default function Alert({ children, kind = "ok", role = "status", className = "" }) {
  const classes = ["alert", kind === "ok" ? "alert--ok" : "alert--danger", className]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={classes} role={role}>
      {children}
    </div>
  );
}
