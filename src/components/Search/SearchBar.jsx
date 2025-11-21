export default function SearchBar() {
  return (
    <div
      className={`h-14 flex-1 bg-surfaceContainer-high flex gap-4 rounded-full p-4`}
    >
      <input
        type="search"
        name="search"
        className="flex-1 rounded-full outline-0 placeholder:text-onSurfaceVarient text-body-large text-onSurface"
        placeholder="Search question"
      />
    </div>
  );
}
