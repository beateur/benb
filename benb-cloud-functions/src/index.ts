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
 * Génère le template HTML de l'email pour le client (demande en attente de validation)
 */
function generateGuestEmailTemplate(data: ReservationData): string {
  const guestName = data.guestName || "Cher voyageur";
  const propertyName = data.propertyName || "La Villa Roya";

  return `
    <!DOCTYPE html>
    <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Demande de réservation reçue</title>
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
            color: #ea580c;
            margin: 0;
            font-size: 28px;
          }
          .pending-badge {
            display: inline-block;
            background-color: #ea580c;
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
          .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 15px;
          }
          .details {
            background-color: #fff7ed;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #ea580c;
          }
          .details-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #fed7aa;
          }
          .details-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #9a3412;
          }
          .value {
            color: #431407;
          }
          .info-box {
            background-color: #fff7ed;
            border-left: 4px solid #f97316;
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
            <span class="pending-badge">⏳ EN ATTENTE DE VALIDATION</span>
            <h1>Demande bien reçue !</h1>
          </div>
          
          <div class="content">
            <p class="greeting">Bonjour ${guestName},</p>
            
            <p>Nous vous remercions chaleureusement pour votre intérêt pour <strong>${propertyName}</strong>.</p>
            
            <p>Votre demande de réservation a bien été transmise à notre famille. Nous l'étudions avec attention et vous recontacterons <strong>très rapidement</strong> pour vous confirmer la disponibilité et finaliser les détails de votre séjour.</p>
            
            ${data.checkInDate ? `
            <div class="details">
              <div class="details-row">
                <span class="label">🏡 Propriété :</span>
                <span class="value">${propertyName}</span>
              </div>
              ${data.checkInDate ? `
              <div class="details-row">
                <span class="label">📅 Arrivée souhaitée :</span>
                <span class="value">${new Date(data.checkInDate.seconds * 1000).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              ` : ""}
              ${data.checkOutDate ? `
              <div class="details-row">
                <span class="label">📅 Départ souhaité :</span>
                <span class="value">${new Date(data.checkOutDate.seconds * 1000).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</span>
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
                <span class="label">💰 Estimation :</span>
                <span class="value">${data.totalPrice}€</span>
              </div>
              ` : ""}
            </div>
            ` : ""}
            
            <div class="info-box">
              <p style="margin: 0; font-weight: 600; color: #9a3412; margin-bottom: 8px;">ℹ️ Prochaines étapes</p>
              <p style="margin: 0; color: #7c2d12;">Notre famille étudiera votre demande et reviendra vers vous sous <strong>24 à 48 heures</strong> pour confirmer ou ajuster votre réservation selon la disponibilité.</p>
            </div>
            
            <p>En attendant, si vous avez la moindre question, n'hésitez pas à nous contacter. Nous serons ravis d'échanger avec vous !</p>
            
            <p style="margin-top: 30px;">Au plaisir de vous accueillir bientôt,<br><strong>La famille - Villa Roya</strong></p>
          </div>
          
          <div class="footer">
            <p>Cet email a été envoyé automatiquement. Pour toute question, vous pouvez nous répondre directement.</p>
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
        <title>Nouvelle demande de réservation</title>
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
            color: #ea580c;
            margin: 0;
            font-size: 28px;
          }
          .alert-badge {
            display: inline-block;
            background-color: #ea580c;
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
            background-color: #fff7ed;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            border-left: 4px solid #ea580c;
          }
          .details-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid #fed7aa;
          }
          .details-row:last-child {
            border-bottom: none;
          }
          .label {
            font-weight: 600;
            color: #9a3412;
          }
          .value {
            color: #431407;
            font-weight: 500;
          }
          .special-requests {
            background-color: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 4px;
          }
          .action-box {
            margin-top: 30px;
            padding: 15px;
            background-color: #fff7ed;
            border-radius: 6px;
            border-left: 4px solid #f97316;
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
            <span class="alert-badge">⏳ DEMANDE EN ATTENTE</span>
            <h1>Nouvelle demande de réservation</h1>
          </div>
          
          <div class="content">
            <p><strong>Une nouvelle demande de réservation vient d'être reçue pour ${propertyName}.</strong></p>
            
            <p style="padding: 12px; background-color: #fff7ed; border-radius: 6px; margin: 15px 0;">
              ℹ️ Le client a été informé que sa demande est <strong>en cours d'étude</strong> et qu'il recevra une réponse sous 24-48h.
            </p>
            
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
                <span class="label">📅 Arrivée souhaitée :</span>
                <span class="value">${new Date(data.checkInDate.seconds * 1000).toLocaleDateString("fr-FR", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
              ` : ""}
              ${data.checkOutDate ? `
              <div class="details-row">
                <span class="label">📅 Départ souhaité :</span>
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
                <span class="label">💰 Estimation :</span>
                <span class="value">${data.totalPrice}€</span>
              </div>
              ` : ""}
            </div>
            
            ${(data as any).specialRequests ? `
            <div class="special-requests">
              <p style="margin: 0; font-weight: 600; color: #92400e; margin-bottom: 8px;">💬 Demandes spéciales du client :</p>
              <p style="margin: 0; color: #78350f;">${(data as any).specialRequests}</p>
            </div>
            ` : ""}
            
            <div class="action-box">
              <p style="margin: 0; font-weight: 600; color: #9a3412; margin-bottom: 8px;">✅ Actions à réaliser :</p>
              <ul style="margin: 8px 0 0 0; padding-left: 20px; color: #7c2d12;">
                <li>Vérifier la disponibilité pour les dates demandées</li>
                <li>Contacter le client sous 24-48h pour confirmer ou proposer des alternatives</li>
                <li>Finaliser les détails du séjour si validation</li>
              </ul>
            </div>
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

      // 📧 Email 1 : Notification au client (demande en attente)
      logger.info(`[Reservation ${reservationId}] Envoi email au client...`);
      const {data: guestData, error: guestError} = await resend.emails.send({
        from: "La Villa Roya <noreply@villaroya.fr>",
        to: guestEmail,
        subject: `Demande de réservation reçue - ${reservationData.propertyName || "La Villa Roya"}`,
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

      // 📧 Email 2 : Notification à l'opérateur (validation requise)
      logger.info(`[Reservation ${reservationId}] Envoi email à l'opérateur...`);
      const {data: operatorData, error: operatorError} = await resend.emails.send({
        from: "La Villa Roya <noreply@villaroya.fr>",
        to: "habilel99@gmail.com",
        subject: `⏳ Nouvelle demande à valider - ${guestName} (${reservationData.propertyName || "La Villa Roya"})`,
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
