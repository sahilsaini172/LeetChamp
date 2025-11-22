import { useState } from "react";

export default function StandardButtonS({
  text = "Label",
  children,
  icon = false,
  onClick,
  className = "",
  disabled,
  style = "none",
}) {
  const styleMap = {
    destruction:
      "bg-error text-onError hover:bg-error/98 outline-errorContainer",
    none: "bg-primary text-onPrimary hover:bg-primary/98 outline-primary",
  };

  const buttonStyles = styleMap[style] || styleMap.none;

  return (
    <div
      className={`rounded-full py-1 ease-in duration-200 flex items-center justify-center ${className}`}
    >
      <button
        disabled={disabled}
        onClick={onClick}
        className={`${buttonStyles} disabled:grayscale flex items-center justify-center rounded-full gap-2 px-4 py-2.5 outline-offset-2 flex-1 active:rounded-lg`}
      >
        {icon && children}
        <span className="text-label-large">{text}</span>
      </button>
    </div>
  );
}
