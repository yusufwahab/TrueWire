import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Trending } from "./pages/Trending";
import { ClaimDetail } from "./pages/ClaimDetail";
import { Verify } from "./pages/Verify";
import { HowItWorks } from "./pages/HowItWorks";
import { Sources } from "./pages/Sources";
import { About } from "./pages/About";
import { ReportClaim } from "./pages/ReportClaim";
import { Insights } from "./pages/Insights";
import { InsightArticle } from "./pages/InsightArticle";
import { Contact } from "./pages/Contact";
import { Auth } from "./pages/Auth";
import { Legal } from "./pages/Legal";
import { NotFound } from "./pages/NotFound";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/trending" element={<Trending />} />
          <Route path="/trending/:slug" element={<ClaimDetail />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/sources" element={<Sources />} />
          <Route path="/about" element={<About />} />
          <Route path="/report" element={<ReportClaim />} />
          <Route path="/insights" element={<Insights />} />
          <Route path="/insights/:slug" element={<InsightArticle />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/privacy" element={<Legal page="privacy" />} />
          <Route path="/terms" element={<Legal page="terms" />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
