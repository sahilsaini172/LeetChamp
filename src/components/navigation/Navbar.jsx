import { Menu, SidebarOpenIcon } from "lucide-react";
import DarkModeToggle from "../../DarkModeToggle";
import IconButton from "../buttons/Iconbutton";

export default function Navbar({ sidebarStatus = false }) {
  return (
    <div className="px-4 py-2.5 flex items-center justify-between sticky z-11 bg-surface backdrop-blur-sm">
      <IconButton>
        {sidebarStatus ? <SidebarOpenIcon size={24} /> : <Menu size={24} />}
      </IconButton>
      <div className="flex flex-col text-onSurface">
        <h1 className=" text-brand">LeetChamp</h1>
      </div>
      <DarkModeToggle />
    </div>
  );
}
