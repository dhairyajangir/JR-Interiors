import React from "react";

export function Honeypot() {
  return (
    <div
      style={{
        display: "none",
        position: "absolute",
        width: "0px",
        height: "0px",
        overflow: "hidden",
      }}
      aria-hidden="true"
    >
      <label htmlFor="website_honey">Leave this field blank</label>
      <input
        id="website_honey"
        type="text"
        name="website_honey"
        tabIndex={-1}
        autoComplete="off"
      />
    </div>
  );
}
