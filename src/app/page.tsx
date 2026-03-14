"use client";

import { useEffect } from "react";
import { useFormStore } from "@/store/useFormStore";
import { initTelegram, getWebApp } from "@/lib/telegram";
import { Registration } from "@/components/screens/Registration";
import { Video } from "@/components/screens/Video";
import { Payment } from "@/components/screens/Payment";

export default function Home() {
  const { step, setStep } = useFormStore();

  useEffect(() => {
    initTelegram();
  }, []);

  useEffect(() => {
    const webapp = getWebApp();
    if (!webapp) return;

    if (step > 0) {
      webapp.BackButton.show();
      const handleBack = () => setStep((step - 1) as 0 | 1);
      webapp.BackButton.onClick(handleBack);
      return () => {
        webapp.BackButton.offClick(handleBack);
      };
    } else {
      webapp.BackButton.hide();
    }
  }, [step, setStep]);

  switch (step) {
    case 0:
      return <Registration />;
    case 1:
      return <Video />;
    case 2:
      return <Payment />;
    default:
      return <Registration />;
  }
}
