/**
 * Cloud Functions pour l'envoi d'emails de confirmation de réservation
 * 
 * Déclenché automatiquement lors de la création d'un document dans Firestore
 * collection 'reservations'
 * 
 * Version 2.0 : Double envoi (client + opérateur)
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
  guestPhone?: string;
  propertyName?: string;
  checkInDate?: any;
  checkOutDate?: any;
  numberOfGuests?: number;
  totalPrice?: number;
  specialRequests?: string;
  createdAt?: any;
}

/**
 * Génère le template HTML de l'email de confirmation pour le client
 */
function generateGuestEmailTemplate(data: ReservationData): string {
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
 * Génère le template HTML de l'email de notification pour l'opérateur
 */
function generateOperatorEmailTemplate(data: ReservationData): string {
  const guestName = data.guestName || "Client inconnu";
  const propertyName = data.propertyName || "La Villa Roya";

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Nouvelle réservation</title>
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
            color: #dc2626;
            margin: 0;
            font-size: 28px;
          }
          .alert-badge {
            display: inline-block;
            background-color: #dc2626;
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 10px;
          }
          .content {
            margin-bottom: 30px;
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
            font-weight: 500;
          }
          .special-requests {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <span class="alert-badge">🔔 NOUVELLE RÉSERVATION</span>
            <h1>Nouvelle demande de réservation</h1>
          </div>
          
          <div class="content">
            <p><strong>Une nouvelle réservation vient d'être enregistrée pour ${propertyName}.</strong></p>
            
            <div class="details">
              <div class="details-row">
                <span class="label">👤 Client :</span>
                <span class="value">${guestName}</span>
              </div>
              <div class="details-row">
                <span class="label">📧 Email :</span>
                <span class="value">${data.guestEmail}</span>
              </div>
              <div class="details-row">
                <span class="label">📱 Téléphone :</span>
                <span class="value">${(data as any).guestPhone || "Non fourni"}</span>
              </div>
              ${data.checkInDate ? `
              <div class="details-row">
                <span class="label">📅 Arrivée :</span>
                <span class="value">${new Date(data.checkInDate.seconds * 1000).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              ` : ""}
              ${data.checkOutDate ? `
              <div class="details-row">
                <span class="label">📅 Départ :</span>
                <span class="value">${new Date(data.checkOutDate.seconds * 1000).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              ` : ""}
              ${data.numberOfGuests ? `
              <div class="details-row">
                <span class="label">👥 Nombre de voyageurs :</span>
                <span class="value">${data.numberOfGuests} personne${data.numberOfGuests > 1 ? "s" : ""}</span>
              </div>
              ` : ""}
              ${data.totalPrice ? `
              <div class="details-row">
                <span class="label">💰 Prix total :</span>
                <span class="value">${data.totalPrice}€</span>
              </div>
              ` : ""}
            </div>
            
            ${(data as any).specialRequests ? `
            <div class="special-requests">
              <p style="margin: 0; font-weight: 600; color: #92400e; margin-bottom: 8px;">⚠️ Demandes spéciales :</p>
              <p style="margin: 0; color: #78350f;">${(data as any).specialRequests}</p>
            </div>
            ` : ""}
            
            <p style="margin-top: 30px; padding: 15px; background-color: #dbeafe; border-radius: 6px; border-left: 4px solid #2563eb;">
              <strong>Action requise :</strong> Contactez le client rapidement pour confirmer la disponibilité et finaliser les détails du séjour.
            </p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement depuis le système de réservation.</p>
            <p style="font-size: 12px; color: #999;">© ${new Date().getFullYear()} La Villa Roya - Système de gestion des réservations</p>
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

      logger.info(`[Reservation ${reservationId}] Préparation des emails`, {
        guestEmail,
        guestName,
      });

      // Initialisation du client Resend avec la clé API sécurisée
      const resend = new Resend(resendApiKey.value());

      // Génération des templates HTML
      const guestHtmlContent = generateGuestEmailTemplate(reservationData);
      const operatorHtmlContent = generateOperatorEmailTemplate(reservationData);

      // 📧 Email 1 : Confirmation au client
      logger.info(`[Reservation ${reservationId}] Envoi email au client...`);
      const {data: guestData, error: guestError} = await resend.emails.send({
        from: "La Villa Roya <noreply@villaroya.space>",
        to: guestEmail,
        subject: `Confirmation de votre demande de réservation - ${reservationData.propertyName || "La Villa Roya"}`,
        html: guestHtmlContent,
      });

      if (guestError) {
        logger.error(`[Reservation ${reservationId}] Erreur lors de l'envoi au client`, {
          error: guestError.message,
          guestEmail,
        });
        // Ne pas bloquer l'envoi à l'opérateur
      } else {
        logger.info(`[Reservation ${reservationId}] Email client envoyé avec succès`, {
          emailId: guestData?.id,
          recipient: guestEmail,
        });
      }

      // 📧 Email 2 : Notification à l'opérateur
      logger.info(`[Reservation ${reservationId}] Envoi email à l'opérateur...`);
      const {data: operatorData, error: operatorError} = await resend.emails.send({
        from: "La Villa Roya <noreply@villaroya.space>",
        to: "habilel99@gmail.com",
        subject: `🔔 Nouvelle réservation - ${guestName} (${reservationData.propertyName || "La Villa Roya"})`,
        html: operatorHtmlContent,
      });

      if (operatorError) {
        logger.error(`[Reservation ${reservationId}] Erreur lors de l'envoi à l'opérateur`, {
          error: operatorError.message,
          operator: "habilel99@gmail.com",
        });
      } else {
        logger.info(`[Reservation ${reservationId}] Email opérateur envoyé avec succès`, {
          emailId: operatorData?.id,
          recipient: "habilel99@gmail.com",
        });
      }

      // Retourner le statut global
      return {
        success: !guestError && !operatorError,
        guestEmailId: guestData?.id,
        operatorEmailId: operatorData?.id,
        guestEmailSent: !guestError,
        operatorEmailSent: !operatorError,
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
