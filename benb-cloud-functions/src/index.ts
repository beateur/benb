/**
 * Cloud Functions pour l'envoi d'emails de confirmation de réservation
 * 
 * Déclenché automatiquement lors de la création d'un document dans Firestore
 * collection 'reservations'
 */

import {setGlobalOptions} from "firebase-functions";
import {onDocumentCreated} from "firebase-functions/v2/firestore";
import * as logger from "firebase-functions/logger";
import {Resend} from "resend";
import {defineString} from "firebase-functions/params";

// Configuration sécurisée de la clé API Resend
const resendApiKey = defineString("RESEND_API_KEY");

// Configuration globale
setGlobalOptions({maxInstances: 10});

/**
 * Interface pour les données de réservation
 */
interface ReservationData {
  guestEmail: string;
  guestName: string;
  propertyName?: string;
  checkInDate?: any;
  checkOutDate?: any;
  numberOfGuests?: number;
  totalPrice?: number;
  createdAt?: any;
}

/**
 * Génère le template HTML de l'email de confirmation
 */
function generateEmailTemplate(data: ReservationData): string {
  const guestName = data.guestName || "Cher client";
  const propertyName = data.propertyName || "notre propriété";

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmation de réservation</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f5f5f5;
          }
          .container {
            background-color: white;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
          }
          .header h1 {
            color: #2563eb;
            margin: 0;
            font-size: 28px;
          }
          .content {
            margin-bottom: 30px;
          }
          .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
          }
          .details {
            background-color: #f8fafc;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
          }
          .details-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #e2e8f0;
          }
          .details-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #64748b;
          }
          .value {
            color: #0f172a;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 14px;
          }
          .cta-button {
            display: inline-block;
            background-color: #2563eb;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✨ Réservation confirmée</h1>
          </div>
          
          <div class="content">
            <p class="greeting">Bonjour ${guestName},</p>
            
            <p>Nous avons bien reçu votre demande de réservation pour <strong>${propertyName}</strong>.</p>
            
            <p>Notre équipe va prendre contact avec vous très prochainement pour finaliser les détails de votre séjour.</p>
            
            ${data.checkInDate ? `
            <div class="details">
              <div class="details-row">
                <span class="label">Propriété :</span>
                <span class="value">${propertyName}</span>
              </div>
              ${data.checkInDate ? `
              <div class="details-row">
                <span class="label">Arrivée :</span>
                <span class="value">${new Date(data.checkInDate.seconds * 1000).toLocaleDateString("fr-FR")}</span>
              </div>
              ` : ""}
              ${data.checkOutDate ? `
              <div class="details-row">
                <span class="label">Départ :</span>
                <span class="value">${new Date(data.checkOutDate.seconds * 1000).toLocaleDateString("fr-FR")}</span>
              </div>
              ` : ""}
              ${data.numberOfGuests ? `
              <div class="details-row">
                <span class="label">Nombre de voyageurs :</span>
                <span class="value">${data.numberOfGuests}</span>
              </div>
              ` : ""}
              ${data.totalPrice ? `
              <div class="details-row">
                <span class="label">Prix total :</span>
                <span class="value">${data.totalPrice}€</span>
              </div>
              ` : ""}
            </div>
            ` : ""}
            
            <p>Si vous avez des questions ou des demandes spéciales, n'hésitez pas à nous contacter.</p>
            
            <p style="margin-top: 30px;">À très bientôt,<br><strong>L'équipe La Villa Roya</strong></p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.</p>
            <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} La Villa Roya - Tous droits réservés</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Cloud Function déclenchée lors de la création d'une nouvelle réservation
 * 
 * Se déclenche automatiquement via Firestore onCreate trigger
 * Envoie un email de confirmation via Resend
 */
export const sendReservationConfirmation = onDocumentCreated(
  "reservations/{reservationId}",
  async (event) => {
    const reservationId = event.params.reservationId;

    logger.info(`[Reservation ${reservationId}] Nouvelle réservation détectée`, {
      reservationId,
      timestamp: new Date().toISOString(),
    });

    try {
      // Récupération des données du document
      const reservationData = event.data?.data() as ReservationData;

      if (!reservationData) {
        logger.error(`[Reservation ${reservationId}] Aucune donnée trouvée`);
        return;
      }

      const {guestEmail, guestName} = reservationData;

      // Validation des champs requis
      if (!guestEmail) {
        logger.error(`[Reservation ${reservationId}] Email manquant`, {
          reservationData,
        });
        return;
      }

      if (!guestName) {
        logger.warn(`[Reservation ${reservationId}] Nom du client manquant`, {
          guestEmail,
        });
      }

      logger.info(`[Reservation ${reservationId}] Préparation de l'email`, {
        guestEmail,
        guestName,
      });

      // Initialisation du client Resend avec la clé API sécurisée
      const resend = new Resend(resendApiKey.value());

      // Génération du template HTML
      const htmlContent = generateEmailTemplate(reservationData);

      // Envoi de l'email de confirmation
      const {data, error} = await resend.emails.send({
        from: "La Villa Roya <noreply@villaroya.space>", // Remplacer par votre domaine vérifié
        to: guestEmail,
        subject: `Confirmation de votre demande de réservation - ${reservationData.propertyName || "La Villa Roya"}`,
        html: htmlContent,
      });

      if (error) {
        logger.error(`[Reservation ${reservationId}] Erreur lors de l'envoi`, {
          error: error.message,
          guestEmail,
        });
        throw new Error(`Resend API error: ${error.message}`);
      }

      logger.info(`[Reservation ${reservationId}] Email envoyé avec succès`, {
        emailId: data?.id,
        recipient: guestEmail,
        guestName,
      });

      return {
        success: true,
        emailId: data?.id,
        reservationId,
      };
    } catch (error) {
      logger.error(`[Reservation ${reservationId}] Erreur critique`, {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      });

      // Ne pas propager l'erreur pour éviter de bloquer la création de la réservation
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        reservationId,
      };
    }
  }
);

//   response.send("Hello from Firebase!");
// });
