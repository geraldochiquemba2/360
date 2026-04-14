import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Carreira 360 <onboarding@resend.dev>',
      to: [email],
      subject: 'Bem-vindo ao Carreira 360!',
      html: `
        <h1>Olá, ${name}!</h1>
        <p>Bem-vindo ao Carreira 360. Estamos muito felizes por te ter connosco.</p>
        <p>Prepara-te para transformar o teu futuro profissional.</p>
        <br />
        <p>Equipa Carreira 360</p>
      `,
    });

    if (error) {
      console.error('Error sending welcome email:', error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error in sendWelcomeEmail:', err);
    return { success: false, error: err };
  }
};

export const sendMentorshipRequestEmail = async (mentorEmail: string, candidateName: string, date: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Carreira 360 <onboarding@resend.dev>',
      to: [mentorEmail],
      subject: 'Novo Pedido de Mentoria',
      html: `
        <h2>Olá!</h2>
        <p>Recebeste um novo pedido de mentoria de <strong>${candidateName}</strong>.</p>
        <p><strong>Data/Hora sugerida:</strong> ${new Date(date).toLocaleString()}</p>
        <p>Acede ao teu painel de controlo para aceitar ou recusar o pedido.</p>
        <br />
        <p>Equipa Carreira 360</p>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
};

export const sendMentorshipConfirmationEmail = async (candidateEmail: string, mentorName: string, meetingLink: string) => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Carreira 360 <onboarding@resend.dev>',
      to: [candidateEmail],
      subject: 'Mentoria Confirmada!',
      html: `
        <h2>Boas notícias!</h2>
        <p>O mentor <strong>${mentorName}</strong> confirmou a tua sessão de mentoria.</p>
        <p><strong>Link da Reunião:</strong> <a href="${meetingLink}">${meetingLink}</a></p>
        <p>Prepara as tuas perguntas e aproveita ao máximo!</p>
        <br />
        <p>Equipa Carreira 360</p>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
};

/**
 * Envia um email para todos os utilizadores da plataforma (Bulk)
 */
export const sendBulkNotification = async (emails: string[], subject: string, content: string) => {
  try {
    // Nota: O Resend permite mandar para múltiplos recipientes ou usar batches.
    // Para simplificar e evitar limites de batch iniciais, vamos usar o array de 'to'.
    const { data, error } = await resend.emails.send({
      from: 'Carreira 360 <onboarding@resend.dev>',
      to: emails,
      subject: subject,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #001F33;">
          <h1 style="color: #0EA5E9;">Novidades do Carreira 360</h1>
          <div style="line-height: 1.6;">
            ${content}
          </div>
          <hr style="border: 1px solid #eee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #666;">Recebeste este email porque estás inscrito na plataforma Carreira 360.</p>
        </div>
      `,
    });

    if (error) return { success: false, error };
    return { success: true, data };
  } catch (err) {
    return { success: false, error: err };
  }
};
