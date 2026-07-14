import { Outlet } from "react-router-dom";
import { Header } from "./Header";
import { TickerStrip } from "./TickerStrip";
import { Footer } from "./Footer";

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />
      <TickerStrip />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
