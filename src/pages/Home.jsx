import { ArrowUpDown, Filter, SortAsc } from "lucide-react";
import IconButton from "../components/buttons/Iconbutton";
import SearchBar from "../components/Search/SearchBar";

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
        <div className="table w-full *:odd:bg-surfaceContainer-low **:p-4 mt-4">
          <div className="table-row-group">
            <div className="table-cell">completed</div>
            <div className="table-cell">Sr.</div>
            <div className="table-cell">question name</div>
            <div className="table-cell">difficulty</div>
            <div className="table-cell">status</div>
          </div>
          <div className="table-row-group">
            <div className="table-cell"></div>
            <div className="table-cell">1.</div>
            <div className="table-cell">Two Sum</div>
            <div className="table-cell">Easy</div>
            <div className="table-cell">Locked</div>
          </div>
        </div>
      </section>
    </div>
  );
}
