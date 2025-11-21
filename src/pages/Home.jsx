import { ArrowUpDown, Filter } from "lucide-react";
import IconButton from "../components/buttons/Iconbutton";
import SearchBar from "../components/Search/SearchBar";
import ProblemRow from "../ProblemItem";

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="p-4">
        <div className="flex gap-4 items-center">
          <SearchBar />
          <div className="flex gap-4">
            <IconButton>
              <Filter />
            </IconButton>
            <IconButton>
              <ArrowUpDown />
            </IconButton>
          </div>
        </div>
        <section className="text-sm w-full">
          <ProblemRow />
        </section>
      </section>
    </div>
  );
}
