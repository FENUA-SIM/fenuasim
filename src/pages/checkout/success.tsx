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

        console.log("orderdetails", orderDetails);
        setOrderStatus("success");
      } catch (error) {
        console.error("Error retrieving order details:", error);
        setOrderStatus("error");
      }
    };

    checkOrderStatus();
  }, [session_id]);

  if (orderStatus === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
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
            className="mt-4 px-6 py-2 bg-fenua-purple text-white rounded-lg hover:opacity-90"
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
                    />
                  </div>

                  {/* Installation Methods */}
                  {/* <div className="w-full max-w-md space-y-4">
                    {orderDetails.esim.apple_installation_url && (
                      <a
                        href={orderDetails.esim.apple_installation_url}
                        className="flex items-center justify-center w-full px-4 py-3 bg-black text-white rounded-lg hover:bg-gray-800"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <span className="mr-2">
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.21 2.33-.91 3.57-.84 1.5.1 2.63.64 3.39 1.64-3.13 1.87-2.42 5.5.48 6.58-.57 1.5-1.31 2.99-2.52 4.79M12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.27 2.23-1.67 4.13-3.74 4.25" />
                          </svg>
                        </span>
                        Installer sur iPhone
                      </a>
                    )}

                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-2">
                        Numéro ICCID de votre eSIM :
                      </p>
                      <p className="font-mono bg-gray-100 p-2 rounded text-sm">
                        {orderDetails.esim.sim_iccid}
                      </p>
                    </div>
                  </div> */}
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
                  l'appareil photo de votre téléphone ou utilisez le lien
                  d'installation pour iPhone
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
                    support@votredomaine.com
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
