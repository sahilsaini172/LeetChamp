export default function TonalButton({
  text = "Label",
  children,
  icon = false,
  onClick,
  className = "",
  disabled,
  style="none"
}) {
  const styleMap = {
    destruction:
      "bg-errorContainer text-onErrorContainer hover:bg-errorContainer/98 outline-errorContainer",
    none: "bg-secondaryContainer text-onSecondaryContainer hover:bg-secondaryContainer/98 outline-secondaryContainer",
  };

  const buttonStyles = styleMap[style] || styleMap.none;

  return (
    <div
      className={`select-none rounded-full py-1 ease-in duration-200 flex items-center justify-center ${className}`}
    >
      <button
        onClick={onClick}
        disabled={disabled}
        className={`${buttonStyles} flex items-center justify-center rounded-full gap-2 px-4 py-2.5 outline-offset-2 flex-1 active:rounded-lg disabled:bg-onSurface/10 disabled:text-onSurface/50`}
      >
        {icon && children}
        <span className="text-label-large">{text}</span>
      </button>
    </div>
  );
}
