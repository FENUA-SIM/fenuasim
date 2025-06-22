import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { CartProvider } from "@/context/CartContext";
import { supabase } from '@/lib/supabase';
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();

  useEffect(() => {
    // Gestion récupération mot de passe
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        router.push('/reset-password');
      }
    });

    // Script Plausible Analytics
    const script = document.createElement("script");
    script.defer = true;
    script.dataset.domain = "fenuasim.com";
    script.dataset.api = "https://plausible.io/api/event";
    script.src = "https://plausible.io/js/script.js";
    document.head.appendChild(script);
  }, [router]);

  return (
    <CartProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </CartProvider>
  );
}
