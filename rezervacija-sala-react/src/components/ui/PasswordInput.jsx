import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";

export default function PasswordInput({
  id,
  label = "Lozinka",
  name = "password",
  value,
  onChange,
  placeholder = "Unesite lozinku",
  autoComplete = "current-password",
  required = true,
  error,
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="field">
      <label htmlFor={id || name}>{label}</label>
      <div className="password-wrap">
        <input
          id={id || name}
          name={name}
          type={show ? "text" : "password"}
          className={error ? "invalid" : ""}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          required={required}
        />
        <button
          type="button"
          className="btn-eye"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Sakrij lozinku" : "Prikaži lozinku"}
          title={show ? "Sakrij lozinku" : "Prikaži lozinku"}
        >
          {show ? <FiEyeOff /> : <FiEye />}
        </button>
      </div>
      {error && <p className="error">{Array.isArray(error) ? error[0] : error}</p>}
    </div>
  );
}
