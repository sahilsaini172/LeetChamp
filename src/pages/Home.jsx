import { ArrowUpDown, Filter } from "lucide-react";
import SearchBar from "../components/Search/SearchBar";
import ProblemRow from "../ProblemItem";
import { useEffect, useState } from "react";
import IcnButton from "../components/buttons/IcnButton";

export default function Home() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    function handleResize() {
      setWidth(window.innerWidth - 32);
    }

    window.addEventListener("resize", handleResize);
    console.log(width);
  });
  return (
    <div className="flex flex-col">
      <section className="p-4">
        <div className="flex gap-4 items-center">
          <SearchBar />
          <div className="flex gap-4">
            <IcnButton>
              <Filter />
            </IcnButton>
            <IcnButton>
              <ArrowUpDown />
            </IcnButton>
          </div>
        </div>
        <ProblemRow />
      </section>
    </div>
  );
}
