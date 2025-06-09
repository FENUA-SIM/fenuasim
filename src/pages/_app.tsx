import "@/styles/globals.css";
import type { AppProps } from "next/app";
import Layout from "@/components/Layout";
import { CartProvider } from "@/context/CartContext";
import { supabase } from '@/lib/supabase';
import { useEffect } from "react";

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event == "PASSWORD_RECOVERY") {
        const newPassword = prompt(
          "What would you like your new password to be?"
        );
        const { data, error } = await supabase.auth.updateUser({
          password: newPassword,
        });
        if (data) alert("Password updated successfully!");
        if (error) alert("There was an error updating your password.");
      }
    });
  }, []);

  return (
    <CartProvider>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </CartProvider>
  );
}
