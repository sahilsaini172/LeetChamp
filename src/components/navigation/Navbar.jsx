import { Menu, SidebarOpenIcon } from "lucide-react";
import DarkModeToggle from "../../DarkModeToggle";
import IcnButton from "../buttons/IcnButton";

export default function Navbar({ sidebarStatus = false }) {
  return (
    <div className="px-4 py-2.5 flex items-center justify-between sticky z-11 bg-surface backdrop-blur-sm">
      <IcnButton>
        {sidebarStatus ? <SidebarOpenIcon size={24} /> : <Menu size={24} />}
      </IcnButton>
      <div className="flex flex-col text-onSurface">
        <h1 className=" text-brand">LeetChamp</h1>
      </div>
      <DarkModeToggle />
    </div>
  );
}
