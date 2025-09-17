import React from "react";

export default function FormCard({ eyebrow, title, subtitle, onSubmit, children }) {
  return (
    <form className="auth-card" onSubmit={onSubmit} noValidate>
      <div className="auth-head">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        {title && <h1>{title}</h1>}
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {children}
    </form>
  );
}
