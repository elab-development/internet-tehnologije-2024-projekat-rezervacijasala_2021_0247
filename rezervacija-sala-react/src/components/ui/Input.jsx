import React from "react";

export default function Input({
  id,
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  error,
}) {
  return (
    <div className="field">
      {label && <label htmlFor={id || name}>{label}</label>}
      <input
        id={id || name}
        name={name}
        type={type}
        className={error ? "invalid" : ""}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        required={required}
      />
      {error && <p className="error">{Array.isArray(error) ? error[0] : error}</p>}
    </div>
  );
}
