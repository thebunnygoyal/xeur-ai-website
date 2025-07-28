import nodemailer from 'nodemailer';

// Email transporter configuration
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_SERVER_HOST,
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Email templates
export const emailTemplates = {
  waitlistConfirmation: (name: string) => ({
    subject: '🎮 Welcome to XEUR.AI Alpha Waitlist!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0b2e 0%, #9d4edd 100%); color: white; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #39ff14; font-size: 28px; margin: 0;">XEUR.AI</h1>
          <p style="color: #9d4edd; font-size: 16px; margin: 5px 0;">Game Creation Just Went God Mode</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 30px; margin-bottom: 30px;">
          <h2 style="color: #39ff14; margin-top: 0;">Welcome to the Revolution, ${name}! 🚀</h2>
          
          <p>You're now part of an exclusive group preparing to transform game creation forever. Thank you for joining the XEUR.AI alpha waitlist!</p>
          
          <h3 style="color: #9d4edd;">What's Next?</h3>
          <ul style="padding-left: 20px;">
            <li>🎯 <strong>Alpha Access:</strong> Limited spots opening Q2 2025</li>
            <li>⚡ <strong>Early Updates:</strong> Be first to know about platform developments</li>
            <li>🎮 <strong>Creator Benefits:</strong> Lifetime Pro account + founding creator badge</li>
            <li>💎 <strong>Exclusive Access:</strong> Direct feedback channel with founders</li>
          </ul>
          
          <h3 style="color: #9d4edd;">The XEUR.AI Advantage:</h3>
          <div style="background: rgba(57, 255, 20, 0.1); border-radius: 10px; padding: 20px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Traditional Game Development:</strong> 1-2 Years → $300K+ → 6% Completion Rate</p>
            <p style="margin: 10px 0 0 0; color: #39ff14;"><strong>XEUR.AI Platform:</strong> 1 Hour → $300 → 80%+ Completion Rate</p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <p style="color: #9d4edd; font-style: italic;">Made in India 🇮🇳 for the World 🌍</p>
          <p style="font-size: 12px; color: rgba(255, 255, 255, 0.7);">
            Follow our journey: 
            <a href="https://github.com/cpg-xeur-ai" style="color: #39ff14;">GitHub</a> | 
            <a href="https://xeur.ai" style="color: #39ff14;">Website</a>
          </p>
        </div>
      </div>
    `,
  }),

  contactConfirmation: (name: string, type: string) => ({
    subject: '📧 We received your message - XEUR.AI Team',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a0b2e; color: white; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #39ff14; font-size: 28px; margin: 0;">XEUR.AI</h1>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 30px;">
          <h2 style="color: #9d4edd; margin-top: 0;">Thank you for reaching out, ${name}!</h2>
          
          <p>We've received your <strong>${type.toLowerCase()}</strong> inquiry and will respond within 24-48 hours.</p>
          
          <p>Our team is excited to connect with innovators, partners, and creators who share our vision of revolutionizing game creation.</p>
          
          <div style="background: rgba(57, 255, 20, 0.1); border-left: 4px solid #39ff14; padding: 15px; margin: 20px 0;">
            <p style="margin: 0;"><strong>Response Time:</strong> 24-48 hours for ${type.toLowerCase()} inquiries</p>
          </div>
          
          <p style="margin-top: 30px;">Best regards,<br/>The XEUR.AI Team</p>
        </div>
      </div>
    `,
  }),

  investmentInquiry: (name: string, company: string) => ({
    subject: '🚀 Investment Inquiry Received - XEUR.AI',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0b2e 0%, #9d4edd 100%); color: white; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #39ff14; font-size: 28px; margin: 0;">XEUR.AI</h1>
          <p style="color: #9d4edd; font-size: 16px; margin: 5px 0;">$25M Pre-Money Valuation | Pre-SEED Round</p>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 30px;">
          <h2 style="color: #39ff14; margin-top: 0;">Thank you for your investment interest, ${name}!</h2>
          
          <p>We're excited about the potential partnership with <strong>${company}</strong> and our shared vision of transforming the $142 billion game creation market.</p>
          
          <h3 style="color: #9d4edd;">Investment Highlights:</h3>
          <ul style="padding-left: 20px;">
            <li>💰 <strong>Pre-SEED Round:</strong> $2.5M at $25M pre-money</li>
            <li>🎯 <strong>Market Opportunity:</strong> $142B in unfinished games annually</li>
            <li>🤝 <strong>Partnership Validated:</strong> Microsoft, NVIDIA, Google, Epic Games</li>
            <li>🚀 <strong>Platform Ready:</strong> 90% complete, launching Q2 2025</li>
            <li>🇮🇳 <strong>Strategic Advantage:</strong> Made in India cost benefits</li>
          </ul>
          
          <p>Our investor relations team will contact you within 24 hours with our complete investment deck and partnership details.</p>
        </div>
      </div>
    `,
  }),

  newsletterWelcome: (name: string) => ({
    subject: '🌟 Welcome to XEUR.AI Updates!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a0b2e; color: white; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #39ff14; font-size: 28px; margin: 0;">XEUR.AI</h1>
        </div>
        
        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 30px;">
          <h2 style="color: #9d4edd; margin-top: 0;">Welcome to our journey, ${name}!</h2>
          
          <p>You'll now receive monthly updates on our platform development, AI model progress, and strategic milestones as we revolutionize game creation.</p>
          
          <p>Stay tuned for exclusive insights into the future of gaming! 🎮</p>
        </div>
      </div>
    `,
  }),
};

// Send email function
export async function sendEmail({
  to,
  subject,
  html,
  from = process.env.EMAIL_FROM || 'noreply@xeur.ai',
}: {
  to: string;
  subject: string;
  html: string;
  from?: string;
}) {
  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });

    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Bulk email function for newsletters
export async function sendBulkEmail({
  recipients,
  subject,
  html,
  from = process.env.EMAIL_FROM || 'noreply@xeur.ai',
}: {
  recipients: string[];
  subject: string;
  html: string;
  from?: string;
}) {
  const results = [];
  
  for (const recipient of recipients) {
    const result = await sendEmail({ to: recipient, subject, html, from });
    results.push({ recipient, ...result });
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  return results;
}