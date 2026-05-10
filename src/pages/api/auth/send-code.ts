import type { APIRoute } from 'astro';
import { db } from '../../../db';
import { users, verificationTokens } from '../../../db/schema/auth';
import { eq, or, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { sendEmail } from '../../../lib/email';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email: rawEmail, password: rawPassword } = await request.json();
    const email = String(rawEmail ?? '').trim().toLowerCase();
    const password = String(rawPassword ?? '');

    if (!email || !password) {
      return new Response(JSON.stringify({ error: 'Email et mot de passe requis' }), { status: 400 });
    }

    const user = await db.query.users.findFirst({
      where: sql`lower(${users.email}) = ${email}`,
    });

    if (!user || !user.password) {
      return new Response(JSON.stringify({ error: 'Identifiants invalides' }), { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new Response(JSON.stringify({ error: 'Identifiants invalides' }), { status: 401 });
    }

    // Générer un code à 6 chiffres
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Sauvegarder le code dans verificationTokens
    // On nettoie les anciens codes pour cet utilisateur d'abord
    await db.delete(verificationTokens).where(
        or(
            eq(verificationTokens.identifier, email),
            eq(verificationTokens.identifier, user.email as string)
        )
    );

    await db.insert(verificationTokens).values({
      identifier: email,
      token: code,
      expires,
    });

    // Envoyer l'email
    await sendEmail({
      to: email,
      subject: 'Votre code de connexion - Cinevasion CMS',
      text: `Votre code de connexion est : ${code}`,
      html: `<p>Votre code de connexion est : <strong>${code}</strong></p><p>Ce code expire dans 10 minutes.</p>`,
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error('Error in send-code:', error);
    return new Response(JSON.stringify({ error: 'Une erreur est survenue' }), { status: 500 });
  }
};
