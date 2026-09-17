import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function PasswordInput({ placeholder = "Enter password", value, onChange, id = "password-field" }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="pw-input-container">
      <Lock size={16} className="pw-icon-left" />
      <input
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="pw-input-field"
      />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="pw-toggle-btn"
        title={showPassword ? "Hide password" : "Show password"}
        aria-label={showPassword ? "Hide password" : "Show password"}
      >
        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>

      <style>{`
        .pw-input-container {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }

        .pw-icon-left {
          position: absolute;
          left: 12px;
          color: var(--text-dim);
          pointer-events: none;
        }

        .pw-input-field {
          width: 100%;
          padding: 10px 40px 10px 36px;
          background-color: var(--bg-main);
          border: 1px solid var(--border-color);
          border-radius: var(--radius-btn);
          color: var(--text-main);
          font-size: 0.9rem;
          font-family: var(--font-body);
        }

        .pw-input-field:focus {
          border-color: var(--accent-burgundy);
          outline: none;
        }

        .pw-toggle-btn {
          position: absolute;
          right: 12px;
          color: var(--text-muted);
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .pw-toggle-btn:hover {
          color: var(--text-main);
        }
      `}</style>
    </div>
  );
}
