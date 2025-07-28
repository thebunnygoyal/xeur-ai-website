import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';
import { successResponse, errorResponse, validators } from '@/lib/utils';
import { z } from 'zod';

// Validation schema
const investmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  company: z.string().max(200, 'Company name too long').optional(),
  position: z.string().max(100, 'Position too long').optional(),
  investmentSize: z.string().max(50, 'Investment size too long').optional(),
  message: z.string().min(10, 'Message must be at least 10 characters').max(2000, 'Message too long'),
  fundType: z.enum(['VC', 'Angel', 'Strategic', 'Family Office', 'Other']).optional(),
  timeline: z.enum(['Immediate', '3-6 months', '6-12 months', '12+ months']).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = investmentSchema.parse(body);
    
    // Create investment inquiry
    const investmentInquiry = await prisma.investmentInquiry.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        company: validatedData.company,
        position: validatedData.position,
        investmentSize: validatedData.investmentSize,
        message: validatedData.message,
        fundType: validatedData.fundType,
        timeline: validatedData.timeline,
        status: 'PENDING',
      },
    });

    // Send confirmation email to investor
    try {
      const confirmationEmail = emailTemplates.investmentInquiry(
        validatedData.name,
        validatedData.company || 'your organization'
      );
      await sendEmail({
        to: validatedData.email,
        subject: confirmationEmail.subject,
        html: confirmationEmail.html,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
    }

    // Send high-priority notification to founders/investor relations
    try {
      const investorTeamEmails = [
        'investors@xeur.ai',
        process.env.ADMIN_EMAIL,
        // Add founder emails here
      ].filter(Boolean);

      for (const email of investorTeamEmails) {
        await sendEmail({
          to: email,
          subject: `🚀 HIGH PRIORITY: New Investment Inquiry from ${validatedData.company || validatedData.name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0b2e 0%, #9d4edd 100%); color: white; padding: 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #39ff14; font-size: 28px; margin: 0;">XEUR.AI</h1>
                <p style="color: #9d4edd; font-size: 16px; margin: 5px 0;">🚀 NEW INVESTMENT INQUIRY</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 30px;">
                <h2 style="color: #39ff14; margin-top: 0;">Investment Inquiry Details</h2>
                
                <div style="background: rgba(57, 255, 20, 0.1); border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="color: #39ff14; margin-top: 0;">Contact Information</h3>
                  <p><strong>Name:</strong> ${validatedData.name}</p>
                  <p><strong>Email:</strong> ${validatedData.email}</p>
                  <p><strong>Company:</strong> ${validatedData.company || 'Not provided'}</p>
                  <p><strong>Position:</strong> ${validatedData.position || 'Not provided'}</p>
                </div>
                
                <div style="background: rgba(157, 78, 221, 0.1); border-radius: 10px; padding: 20px; margin-bottom: 20px;">
                  <h3 style="color: #9d4edd; margin-top: 0;">Investment Details</h3>
                  <p><strong>Fund Type:</strong> ${validatedData.fundType || 'Not specified'}</p>
                  <p><strong>Investment Size:</strong> ${validatedData.investmentSize || 'Not specified'}</p>
                  <p><strong>Timeline:</strong> ${validatedData.timeline || 'Not specified'}</p>
                </div>
                
                <h3 style="color: #9d4edd;">Message:</h3>
                <div style="background: rgba(0, 0, 0, 0.3); padding: 15px; border-radius: 8px; border-left: 4px solid #39ff14; margin-bottom: 20px;">
                  <p style="margin: 0; white-space: pre-wrap;">${validatedData.message}</p>
                </div>
                
                <div style="background: rgba(57, 255, 20, 0.1); border-radius: 8px; padding: 15px;">
                  <p style="margin: 0;"><strong>Inquiry ID:</strong> ${investmentInquiry.id}</p>
                  <p style="margin: 0;"><strong>Submitted:</strong> ${new Date().toISOString()}</p>
                  <p style="margin: 0;"><strong>RESPONSE REQUIRED:</strong> Within 24 hours (HIGH PRIORITY)</p>
                </div>
              </div>
              
              <div style="text-align: center; margin-top: 20px;">
                <p style="color: #39ff14; font-weight: bold;">Pre-SEED Round: $2.5M at $25M Pre-money</p>
                <p style="color: #9d4edd; font-size: 12px;">
                  <a href="https://xeur.ai/admin/investments" style="color: #39ff14;">View in Admin Dashboard</a>
                </p>
              </div>
            </div>
          `,
        });
        
        // Add delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (teamEmailError) {
      console.error('Failed to send team notification:', teamEmailError);
    }

    // Send Slack notification (if webhook configured)
    try {
      if (process.env.SLACK_WEBHOOK_URL) {
        await fetch(process.env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `🚀 NEW INVESTMENT INQUIRY`,
            blocks: [
              {
                type: 'header',
                text: {
                  type: 'plain_text',
                  text: '🚀 New Investment Inquiry - XEUR.AI'
                }
              },
              {
                type: 'section',
                fields: [
                  { type: 'mrkdwn', text: `*Name:* ${validatedData.name}` },
                  { type: 'mrkdwn', text: `*Company:* ${validatedData.company || 'Not provided'}` },
                  { type: 'mrkdwn', text: `*Email:* ${validatedData.email}` },
                  { type: 'mrkdwn', text: `*Investment Size:* ${validatedData.investmentSize || 'Not specified'}` },
                  { type: 'mrkdwn', text: `*Fund Type:* ${validatedData.fundType || 'Not specified'}` },
                  { type: 'mrkdwn', text: `*Timeline:* ${validatedData.timeline || 'Not specified'}` }
                ]
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*Message:*\n${validatedData.message.substring(0, 200)}${validatedData.message.length > 200 ? '...' : ''}`
                }
              },
              {
                type: 'actions',
                elements: [
                  {
                    type: 'button',
                    text: { type: 'plain_text', text: 'View Details' },
                    url: `https://xeur.ai/admin/investments/${investmentInquiry.id}`,
                    style: 'primary'
                  }
                ]
              }
            ]
          })
        });
      }
    } catch (slackError) {
      console.error('Failed to send Slack notification:', slackError);
    }

    // Track analytics
    try {
      await prisma.analytics.create({
        data: {
          event: 'investment_inquiry',
          page: '/investment',
          data: {
            company: validatedData.company,
            fundType: validatedData.fundType,
            investmentSize: validatedData.investmentSize,
            timeline: validatedData.timeline,
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
        id: investmentInquiry.id,
        status: investmentInquiry.status,
        company: validatedData.company
      },
      `🚀 Thank you ${validatedData.name}! We've received your investment inquiry and our investor relations team will contact you within 24 hours with our complete investment deck.`
    );

  } catch (error) {
    console.error('Investment API error:', error);
    
    if (error instanceof z.ZodError) {
      return errorResponse(
        `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }

    return errorResponse('Failed to submit investment inquiry. Please try again.', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const fundType = searchParams.get('fundType');
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (status) where.status = status;
    if (fundType) where.fundType = fundType;

    // Get investment inquiries with pagination
    const [inquiries, total] = await Promise.all([
      prisma.investmentInquiry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          company: true,
          position: true,
          investmentSize: true,
          fundType: true,
          timeline: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.investmentInquiry.count({ where }),
    ]);

    return successResponse({
      inquiries,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        pending: await prisma.investmentInquiry.count({ where: { status: 'PENDING' } }),
        responded: await prisma.investmentInquiry.count({ where: { status: 'RESPONDED' } }),
        byFundType: await prisma.investmentInquiry.groupBy({
          by: ['fundType'],
          _count: { fundType: true },
        }),
      },
    });

  } catch (error) {
    console.error('Investment GET error:', error);
    return errorResponse('Failed to retrieve investment inquiries', 500);
  }
}

// Update investment inquiry status (PATCH method)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, response } = body;

    if (!id) {
      return errorResponse('Investment inquiry ID is required', 400);
    }

    if (!['PENDING', 'RESPONDED', 'ARCHIVED'].includes(status)) {
      return errorResponse('Invalid status', 400);
    }

    // Update inquiry
    const updatedInquiry = await prisma.investmentInquiry.update({
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
        company: true,
        status: true,
        response: true,
        respondedAt: true,
        updatedAt: true,
      },
    });

    // If responding, send email to investor
    if (status === 'RESPONDED' && response) {
      try {
        await sendEmail({
          to: updatedInquiry.email,
          subject: `🚀 Investment Opportunity Response - XEUR.AI Pre-SEED Round`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a0b2e 0%, #9d4edd 100%); color: white; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #39ff14; font-size: 28px; margin: 0;">XEUR.AI</h1>
                <p style="color: #9d4edd; font-size: 16px; margin: 5px 0;">Pre-SEED Investment Opportunity</p>
              </div>
              
              <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 30px;">
                <h2 style="color: #39ff14; margin-top: 0;">Thank you for your investment interest!</h2>
                
                <p>Dear ${updatedInquiry.name},</p>
                
                <p>Thank you for your interest in XEUR.AI's Pre-SEED funding round. We're excited about the potential partnership with ${updatedInquiry.company || 'your organization'}.</p>
                
                <div style="background: rgba(57, 255, 20, 0.1); border-radius: 10px; padding: 20px; margin: 20px 0;">
                  <h3 style="color: #39ff14; margin-top: 0;">Investment Highlights</h3>
                  <ul style="padding-left: 20px;">
                    <li>💰 <strong>Pre-SEED Round:</strong> $2.5M at $25M pre-money</li>
                    <li>🎯 <strong>Market Opportunity:</strong> $142B in unfinished games annually</li>
                    <li>🤝 <strong>Partnership Validated:</strong> Microsoft, NVIDIA, Google, Epic Games</li>
                    <li>🚀 <strong>Platform Ready:</strong> 90% complete, launching Q2 2025</li>
                    <li>🇮🇳 <strong>Strategic Advantage:</strong> Made in India cost benefits</li>
                  </ul>
                </div>
                
                <div style="background: rgba(0, 0, 0, 0.3); padding: 20px; border-radius: 10px; border-left: 4px solid #39ff14; margin: 20px 0;">
                  <p style="margin: 0; white-space: pre-wrap;">${response}</p>
                </div>
                
                <p>We look forward to discussing this opportunity further and sharing our complete investment materials.</p>
                
                <p style="margin-top: 30px;">Best regards,<br/>The XEUR.AI Investment Team</p>
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

    return successResponse(updatedInquiry, 'Investment inquiry updated successfully');

  } catch (error) {
    console.error('Investment PATCH error:', error);
    
    if (error.code === 'P2025') {
      return errorResponse('Investment inquiry not found', 404);
    }

    return errorResponse('Failed to update investment inquiry', 500);
  }
}