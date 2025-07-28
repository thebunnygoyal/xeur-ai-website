import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';
import { successResponse, errorResponse, validators } from '@/lib/utils';
import { z } from 'zod';

// Validation schema
const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Subject is required').max(200, 'Subject too long'),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  type: z.enum(['GENERAL', 'TECHNICAL', 'PARTNERSHIP', 'INVESTMENT', 'PRESS', 'SUPPORT']).default('GENERAL'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = contactSchema.parse(body);
    
    // Create contact form entry
    const contactForm = await prisma.contactForm.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        subject: validatedData.subject,
        message: validatedData.message,
        type: validatedData.type as any,
        status: 'PENDING',
      },
    });

    // Send confirmation email to user
    try {
      const confirmationEmail = emailTemplates.contactConfirmation(
        validatedData.name,
        validatedData.type
      );
      await sendEmail({
        to: validatedData.email,
        subject: confirmationEmail.subject,
        html: confirmationEmail.html,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    // Route to appropriate team email based on type
    const getTeamEmail = (type: string) => {
      const emailMap = {
        GENERAL: process.env.EMAIL_FROM || 'hello@xeur.ai',
        TECHNICAL: 'support@xeur.ai',
        PARTNERSHIP: 'partnerships@xeur.ai',
        INVESTMENT: 'investors@xeur.ai',
        PRESS: 'press@xeur.ai',
        SUPPORT: 'support@xeur.ai',
      };
      return emailMap[type] || emailMap.GENERAL;
    };

    // Send notification to team
    try {
      const teamEmail = getTeamEmail(validatedData.type);
      await sendEmail({
        to: teamEmail,
        subject: `📧 New ${validatedData.type} Inquiry: ${validatedData.subject}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a0b2e; color: white; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #39ff14; font-size: 24px; margin: 0;">XEUR.AI</h1>
              <p style="color: #9d4edd; margin: 5px 0;">New Contact Form Submission</p>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 20px;">
              <h2 style="color: #9d4edd; margin-top: 0;">Contact Details</h2>
              <p><strong style="color: #39ff14;">Type:</strong> ${validatedData.type}</p>
              <p><strong style="color: #39ff14;">Name:</strong> ${validatedData.name}</p>
              <p><strong style="color: #39ff14;">Email:</strong> ${validatedData.email}</p>
              <p><strong style="color: #39ff14;">Subject:</strong> ${validatedData.subject}</p>
              
              <h3 style="color: #9d4edd;">Message:</h3>
              <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px; border-left: 4px solid #39ff14;">
                <p style="margin: 0; white-space: pre-wrap;">${validatedData.message}</p>
              </div>
              
              <div style="background: rgba(57, 255, 20, 0.1); border-radius: 8px; padding: 15px; margin-top: 20px;">
                <p style="margin: 0;"><strong>Contact ID:</strong> ${contactForm.id}</p>
                <p style="margin: 0;"><strong>Submitted:</strong> ${new Date().toISOString()}</p>
                <p style="margin: 0;"><strong>Response Required:</strong> Within 24-48 hours</p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px;">
              <p style="color: #9d4edd; font-size: 12px;">
                <a href="https://xeur.ai/admin/contacts" style="color: #39ff14;">View in Admin Dashboard</a>
              </p>
            </div>
          </div>
        `,
      });
    } catch (teamEmailError) {
      console.error('Failed to send team notification:', teamEmailError);
    }

    // Track analytics
    try {
      await prisma.analytics.create({
        data: {
          event: 'contact_form_submit',
          page: '/contact',
          data: {
            type: validatedData.type,
            subject: validatedData.subject,
            messageLength: validatedData.message.length,
          },
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        },
      });
    } catch (analyticsError) {
      console.error('Failed to track analytics:', analyticsError);
    }

    return successResponse(
      { 
        id: contactForm.id,
        type: contactForm.type,
        status: contactForm.status
      },
      `📧 Thank you ${validatedData.name}! We've received your ${validatedData.type.toLowerCase()} inquiry and will respond within 24-48 hours.`
    );

  } catch (error) {
    console.error('Contact API error:', error);
    
    if (error instanceof z.ZodError) {
      return errorResponse(
        `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }

    return errorResponse('Failed to submit contact form. Please try again.', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (type) where.type = type;
    if (status) where.status = status;

    // Get contacts with pagination
    const [contacts, total] = await Promise.all([
      prisma.contactForm.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          subject: true,
          message: true,
          type: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.contactForm.count({ where }),
    ]);

    return successResponse({
      contacts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Contact GET error:', error);
    return errorResponse('Failed to retrieve contacts', 500);
  }
}

// Update contact status (PATCH method)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, response } = body;

    if (!id) {
      return errorResponse('Contact ID is required', 400);
    }

    if (!['PENDING', 'RESPONDED', 'ARCHIVED'].includes(status)) {
      return errorResponse('Invalid status', 400);
    }

    // Update contact
    const updatedContact = await prisma.contactForm.update({
      where: { id },
      data: {
        status: status as any,
        response,
        respondedAt: status === 'RESPONDED' ? new Date() : null,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
        email: true,
        subject: true,
        type: true,
        status: true,
        response: true,
        respondedAt: true,
        updatedAt: true,
      },
    });

    // If responding, send email to user
    if (status === 'RESPONDED' && response) {
      try {
        await sendEmail({
          to: updatedContact.email,
          subject: `Re: ${updatedContact.subject} - XEUR.AI Team Response`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a0b2e; color: white; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #39ff14; font-size: 28px; margin: 0;">XEUR.AI</h1>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 30px;">
                <h2 style="color: #9d4edd; margin-top: 0;">Response to your inquiry</h2>
                
                <p>Dear ${updatedContact.name},</p>
                
                <p>Thank you for your ${updatedContact.type.toLowerCase()} inquiry regarding: <strong>"${updatedContact.subject}"</strong></p>
                
                <div style="background: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 10px; border-left: 4px solid #39ff14; margin: 20px 0;">
                  <p style="margin: 0; white-space: pre-wrap;">${response}</p>
                </div>
                
                <p>If you have any follow-up questions, please don't hesitate to reach out.</p>
                
                <p style="margin-top: 30px;">Best regards,<br/>The XEUR.AI Team</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #9d4edd; font-style: italic;">Made in India 🇮🇳 for the World 🌍</p>
              </div>
            </div>
          `,
        });
      } catch (emailError) {
        console.error('Failed to send response email:', emailError);
      }
    }

    return successResponse(updatedContact, 'Contact updated successfully');

  } catch (error) {
    console.error('Contact PATCH error:', error);
    
    if (error.code === 'P2025') {
      return errorResponse('Contact not found', 404);
    }

    return errorResponse('Failed to update contact', 500);
  }
}