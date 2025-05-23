import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "@/lib/supabaseClient";

export default function SuccessPage() {
  const router = useRouter();
  const { session_id } = router.query;
  const [orderStatus, setOrderStatus] = useState<
    "loading" | "success" | "error"
  >("loading");
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [emailStatus, setEmailStatus] = useState<
    "pending" | "sending" | "sent" | "failed"
  >("pending");

  useEffect(() => {
    if (!session_id) return;

    const checkOrderStatus = async () => {
      try {
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("stripe_session_id", session_id)
          .maybeSingle();

        if (orderError) throw orderError;
        if (!orderData) return setOrderStatus("error");

        const { data: esimData, error: esimError } = await supabase
          .from("airalo_orders")
          .select("*")
          .eq("package_id", orderData.package_id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (esimError) throw esimError;

        setOrderDetails({
          ...orderData,
          esim: esimData || null,
        });

        setOrderStatus("success");
      } catch (error) {
        console.error("Error retrieving order details:", error);
        setOrderStatus("error");
      }
    };

    checkOrderStatus();
  }, [session_id]);

  const sendEmail = async () => {
    if (!orderDetails?.esim?.qr_code_url) {
      console.log("No QR code available, skipping email");
      return;
    }

    try {
      setEmailStatus("sending");

      const emailPayload = {
        email: orderDetails.email,
        customerName:
          orderDetails.esim?.nom || orderDetails.esim?.prenom || "Client",
        packageName: orderDetails.package_name,
        destinationName:
          extractDestinationName(orderDetails.package_name) || "Canada",
        dataAmount: orderDetails.data_amount,
        dataUnit: orderDetails.data_unit || "GB",
        validityDays: orderDetails.validity_days,
        qrCodeUrl: orderDetails.esim.qr_code_url,
      };

      const response = await fetch("/api/send-esim-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });

      const result = await response.json();

      if (response.ok) {
        setEmailStatus("sent");
      } else {
        console.error("Email sending failed:", result);
        setEmailStatus("failed");
      }
    } catch (error) {
      console.error("Failed to send email:", error);
      setEmailStatus("failed");
    }
  };

  const extractDestinationName = (packageName: string) => {
    if (!packageName) return "votre destination";
    const destination = document.cookie
      .split("; ")
      .find((row) => row.startsWith("region="))
      ?.split("=")[1];

    return destination;
  };

  useEffect(() => {
    if (
      orderStatus === "success" &&
      orderDetails?.esim?.qr_code_url &&
      emailStatus === "pending"
    ) {
      const timer = setTimeout(() => {
        sendEmail();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [orderStatus, orderDetails, emailStatus]);

  const resendEmail = async () => {
    setEmailStatus("pending");
    await sendEmail();
  };

  if (orderStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fenua-purple mx-auto mb-4"></div>
          <h1 className="text-2xl font-bold mb-4">
            Traitement de votre commande...
          </h1>
          <p>Veuillez patienter pendant que nous finalisons votre commande.</p>
        </div>
      </div>
    );
  }

  if (orderStatus === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4 text-red-600">Erreur</h1>
          <p>Une erreur est survenue lors du traitement de votre commande.</p>
          <button
            onClick={() => router.push("/shop")}
            className="mt-4 px-6 py-2 bg-fenua-purple text-white bg-black rounded-lg hover:opacity-90"
          >
            Retour à la boutique
          </button>
        </div>
      </div>
    );
  }

  // Check if we have eSIM QR code data
  const hasEsimData = orderDetails?.esim && orderDetails.esim.qr_code_url;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-3xl w-full p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-600 mb-2">
            Commande confirmée !
          </h1>
          <p className="text-gray-600">
            {hasEsimData
              ? "Votre eSIM est prête à être installée"
              : "Votre eSIM est en cours de préparation"}
          </p>

          {/* Email Status Indicator */}
          {hasEsimData && (
            <div className="mt-4 p-3 rounded-lg border">
              {emailStatus === "sending" && (
                <div className="flex items-center justify-center text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Envoi de l'email en cours...
                </div>
              )}
              {emailStatus === "sent" && (
                <div className="flex items-center justify-center text-green-600">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Email envoyé avec succès à {orderDetails.email}
                </div>
              )}
              {emailStatus === "failed" && (
                <div className="flex items-center justify-center text-red-600">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Échec de l'envoi de l'email
                  <button
                    onClick={resendEmail}
                    className="ml-2 text-sm underline hover:no-underline"
                  >
                    Réessayer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {orderDetails && (
          <div className="space-y-6">
            {/* QR Code Section - Only show if available */}
            {hasEsimData && (
              <div className="border-t pt-6">
                <h2 className="text-xl font-semibold mb-4 text-center">
                  Votre eSIM est prête
                </h2>
                <div className="flex flex-col items-center justify-center">
                  {/* QR Code Image */}
                  <div className="mb-6 p-4 bg-white rounded-lg shadow-md">
                    <img
                      src={orderDetails.esim.qr_code_url}
                      alt="eSIM QR Code"
                      className="w-64 h-64 mx-auto"
                      onError={(e) => {
                        console.error("QR Code image failed to load");
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </div>

                  {/* ICCID Display */}
                  {orderDetails.esim.sim_iccid && (
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600 mb-2">
                        Numéro ICCID de votre eSIM :
                      </p>
                      <p className="font-mono bg-gray-100 p-2 rounded text-sm">
                        {orderDetails.esim.sim_iccid}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Order Details */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">
                Détails de votre commande
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Forfait</p>
                  <p className="font-medium">
                    {orderDetails.package_name ||
                      (orderDetails.airalo_packages &&
                        orderDetails.airalo_packages.name)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Données</p>
                  <p className="font-medium">
                    {orderDetails.data_amount ||
                      (orderDetails.airalo_packages &&
                        orderDetails.airalo_packages.data_amount)}{" "}
                    {orderDetails.data_unit ||
                      (orderDetails.airalo_packages &&
                        orderDetails.airalo_packages.data_unit) ||
                      "GB"}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Validité</p>
                  <p className="font-medium">
                    {orderDetails.validity_days ||
                      (orderDetails.airalo_packages &&
                        orderDetails.airalo_packages.validity_days)}{" "}
                    jours
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Email</p>
                  <p className="font-medium">{orderDetails.email}</p>
                </div>
                <div>
                  <p className="text-gray-600">Statut</p>
                  <p className="font-medium">
                    {orderDetails.esim?.status === "success"
                      ? "Prêt à l'emploi"
                      : orderDetails.status}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Date de commande</p>
                  <p className="font-medium">
                    {new Date(orderDetails.created_at).toLocaleDateString(
                      "fr-FR",
                      {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Installation Instructions */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">
                Instructions d'installation
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-gray-600">
                <li>
                  <span className="font-medium">Scannez le code QR</span> avec
                  l'appareil photo de votre téléphone
                </li>
                <li>
                  <span className="font-medium">Suivez les instructions</span>{" "}
                  pour ajouter l'eSIM à votre appareil
                </li>
                <li>
                  <span className="font-medium">Activez l'eSIM</span> en
                  sélectionnant "Données cellulaires" dans les paramètres
                </li>
                <li>
                  <span className="font-medium">Activez l'itinérance</span> si
                  nécessaire pour utiliser votre forfait
                </li>
              </ol>
            </div>

            {/* Support Information */}
            <div className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Besoin d'aide ?</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="mb-3">
                  Si vous rencontrez des difficultés avec l'installation de
                  votre eSIM, n'hésitez pas à contacter notre support :
                </p>
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Email :</span>{" "}
                    hassanmehmoodedev171@gmail.com
                  </p>
                  <p>
                    <span className="font-medium">Téléphone :</span> +33 123 456
                    789
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="border-t pt-6 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => router.push("/shop")}
                className="flex-1 px-6 py-3 bg-fenua-purple text-white rounded-lg hover:opacity-90"
              >
                Retour à la boutique
              </button>

              {/* Email resend button if failed */}
              {emailStatus === "failed" && hasEsimData && (
                <button
                  onClick={resendEmail}
                  className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-lg hover:opacity-90"
                >
                  Renvoyer l'email
                </button>
              )}

              {/* Add download button if QR code is available */}
              {hasEsimData && (
                <a
                  href={orderDetails.esim.qr_code_url}
                  download="esim-qr-code.png"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:opacity-90 text-center"
                >
                  Télécharger le QR Code
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
