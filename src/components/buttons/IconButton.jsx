export default function IconButton({ onClick, children, className = "" }) {
  return (
    <div
      onClick={onClick}
      className={`p-2 hover:bg-onSurface/8 *:text-onSurface *:hover: w-fit rounded-lg duration-100 ease-in ${className}`}
    >
      {children}
    </div>
  );
}
