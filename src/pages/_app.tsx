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
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY") {
        router.push('/reset-password');
      }
      
      // Only handle sign out in other tabs
      if (event === "USER_UPDATED" && router.pathname !== '/reset-password') {
        await supabase.auth.signOut();
        router.push('/login');
      }
    });
  }, [router]);

  return (
    <CartProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </CartProvider>
  );
}
