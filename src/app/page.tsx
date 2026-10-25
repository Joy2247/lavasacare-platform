"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Toaster } from "sonner";
import { useLavasa } from "@/lib/store";
import { Header } from "@/components/lavasacare/Header";
import { CustomCursor } from "@/components/lavasacare/CustomCursor";
import { IntroLoader } from "@/components/lavasacare/IntroLoader";
import { Footer } from "@/components/lavasacare/Footer";
import { EmergencyDialog } from "@/components/lavasacare/EmergencyDialog";
import { HomeView } from "@/components/lavasacare/HomeView";
import { FindView } from "@/components/lavasacare/FindView";
import { AppointmentsView } from "@/components/lavasacare/AppointmentsView";
import { MedicineView } from "@/components/lavasacare/MedicineView";
import { PackagesView } from "@/components/lavasacare/PackagesView";
import { BedsView } from "@/components/lavasacare/BedsView";
import { CoverageView } from "@/components/lavasacare/CoverageView";
import { ContactView } from "@/components/lavasacare/ContactView";
import { AdminView } from "@/components/lavasacare/AdminView";
import { Siren } from "lucide-react";

export default function LavasaCarePage() {
  const view = useLavasa((s) => s.view);
  const [emgOpen, setEmgOpen] = useState(false);

  // Scroll to top whenever the user switches sections
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [view]);

  return (
    <div className="flex min-h-screen flex-col">
      {/* branded opening — doctor pushing the progress bar */}
      <IntroLoader />

      <Header />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            {view === "home" ? <HomeView /> : null}
            {view === "find" ? <FindView /> : null}
            {view === "appointments" ? <AppointmentsView /> : null}
            {view === "medicine" ? <MedicineView /> : null}
            {view === "packages" ? <PackagesView /> : null}
            {view === "beds" ? <BedsView /> : null}
            {view === "coverage" ? <CoverageView /> : null}
            {view === "contact" ? <ContactView /> : null}
            {view === "admin" ? <AdminView /> : null}
          </motion.div>
        </AnimatePresence>
      </main>

      <Footer />

      {/* Floating SOS — emergency guidance always one tap away (FR-14) */}
      <motion.button
        onClick={() => setEmgOpen(true)}
        className="fixed bottom-5 right-5 z-50 flex size-14 items-center justify-center rounded-full bg-rose-600 text-white shadow-lg shadow-black/15 animate-pulse-ring"
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Emergency guidance and numbers"
        title="Emergency guidance"
      >
        <Siren className="size-6" aria-hidden />
        <span className="absolute -top-9 right-0 whitespace-nowrap rounded-full bg-ink px-3 py-1 text-[11px] font-bold text-white opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100 [pointer-events:none] max-sm:hidden">
          Emergency?
        </span>
      </motion.button>

      <EmergencyDialog open={emgOpen} onOpenChange={setEmgOpen} />
      <Toaster position="top-center" richColors closeButton />
      <CustomCursor />
    </div>
  );
}
