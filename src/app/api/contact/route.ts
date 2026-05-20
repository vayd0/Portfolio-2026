import { Resend } from "resend";
import { NextRequest, NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);
const TO = "hello@theoheck.fr";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { type } = body;

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("[contact] RESEND_API_KEY manquant");
      return NextResponse.json({ ok: false, error: "API key manquante" }, { status: 500 });
    }
    let result;
    if (type === "mail") {
      const { email, message } = body;
      result = await resend.emails.send({
        from: "Portfolio Contact <contact@theoheck.fr>",
        to: TO,
        replyTo: email,
        subject: `Message de ${email}`,
        html: `
          <p><strong>De :</strong> ${email}</p>
          <p><strong>Reçu le :</strong> ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</p>
          <hr/>
          <p>${message.replace(/\n/g, "<br/>")}</p>
        `,
      });
    } else if (type === "call") {
      const { firstName, lastName, phone, brief, day, time } = body;
      result = await resend.emails.send({
        from: "Portfolio Contact <contact@theoheck.fr>",
        to: TO,
        subject: `Demande d'appel — ${firstName} ${lastName}`,
        html: `
          <p><strong>Nom :</strong> ${firstName} ${lastName}</p>
          <p><strong>Téléphone :</strong> ${phone}</p>
          <p><strong>Créneau :</strong> ${day} à ${time}</p>
          ${brief ? `<p><strong>Sujet :</strong> ${brief.replace(/\n/g, "<br/>")}</p>` : ""}
          <p><strong>Reçu le :</strong> ${new Date().toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}</p>
        `,
      });
    }

    if (result?.error) {
      console.error("[contact] Resend error:", result.error);
      return NextResponse.json({ ok: false, error: result.error }, { status: 500 });
    }

    console.log("[contact] Sent:", result?.data);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Resend error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
