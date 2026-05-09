import Sidebar from "./Sidebar";
import Header from "./Header";

export default function Layout({ children }) {
  return (
    <div className="flex h-screen bg-oscuro font-poppins overflow-hidden w-full">
      <Sidebar />

      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
