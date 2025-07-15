import { Outlet } from "react-router-dom";
import Logo from "@/assets/logo.png";

const PublicLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col md:flex-row">
        <div className="flex items-center justify-center w-full md:w-1/2 p-4">
          <img src={Logo} alt="Logo" className="max-w-xs w-full h-auto" />
        </div>
        <div className="flex items-center justify-center w-full md:w-1/2 p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default PublicLayout;
