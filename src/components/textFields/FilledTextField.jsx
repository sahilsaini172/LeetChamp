import { Search, XCircle } from "lucide-react";
import { useState } from "react";

export default function FilledTextField({
  type = "text",
  label = false,
  leadingIcon = false,
  trailingIcon = false,
  supportingText = true,
  leading = <Search />,
  trailing = <XCircle />,
  value,
  placeholder = "Label Text",
  className = "",
  supporting = "Supporting text",
  onChange,
  disabled,
  min,
  max,
}) {
  const [showLabel, setShowLabel] = useState(label);
  return (
    <div
      onClick={() => setShowLabel(true)}
      disabled={disabled}
      className={`relative flex rounded-t-sm border-b border-b-onSurfaceVarient flex-col justify-center ${className}  bg-surfaceContainer-highest h-14 py-1 focus:border-b-2 birder-b-primary disabled:grayscale`}
    >
      <div className="flex items-center w-full">
        {leadingIcon && (
          <span className=" size-12 flex items-center justify-center text-onSurfaceVarient mr-1">
            {leading}
          </span>
        )}
        <div className={`flex flex-col w-full ${!leadingIcon ? "px-4" : ""}`}>
          <span className={label ? "text-primary" : "text-onSurfaceVarient"}>
            {placeholder}
          </span>
          {showLabel && (
            <input
              min={min}
              max={max}
              onChange={onChange}
              type={type}
              name=""
              id=""
              placeholder={placeholder}
              value={value}
              className={`flex-1 text-onSurfaceVarient text-body-large outline-0 w-full`}
            />
          )}
        </div>
        {trailingIcon && (
          <span className="size-12 flex items-center justify-center text-onSurfaceVarient ml-1">
            {trailing}
          </span>
        )}
        {supportingText && (
          <span
            className={`absolute -bottom-5 text-body-small text-onSurfaceVarient ${
              !leadingIcon ? "px-4" : "ml-[52px]"
            }`}
          >
            {supporting}
          </span>
        )}
      </div>
    </div>
  );
}
