import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';
import { successResponse, errorResponse, validators } from '@/lib/utils';
import { z } from 'zod';

// Validation schema
const newsletterSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().optional(),
  source: z.string().optional(),
  preferences: z.object({
    frequency: z.enum(['weekly', 'monthly', 'quarterly']).default('monthly'),
    topics: z.array(z.string()).default(['platform-updates', 'industry-news']),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = newsletterSchema.parse(body);
    
    // Check if email already exists
    const existingSubscription = await prisma.newsletter.findUnique({
      where: { email: validatedData.email }
    });

    if (existingSubscription) {
      if (existingSubscription.isActive) {
        return errorResponse('Email is already subscribed to our newsletter', 409);
      } else {
        // Reactivate subscription
        const reactivated = await prisma.newsletter.update({
          where: { email: validatedData.email },
          data: {
            isActive: true,
            preferences: validatedData.preferences || existingSubscription.preferences,
            source: validatedData.source || existingSubscription.source,
            updatedAt: new Date(),
          },
        });

        return successResponse(
          { 
            id: reactivated.id,
            email: reactivated.email,
            reactivated: true
          },
          '🌟 Welcome back! Your newsletter subscription has been reactivated.'
        );
      }
    }

    // Create new subscription
    const subscription = await prisma.newsletter.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        isActive: true,
        preferences: validatedData.preferences || {
          frequency: 'monthly',
          topics: ['platform-updates', 'industry-news']
        },
        source: validatedData.source || 'website',
      },
    });

    // Send welcome email
    try {
      const welcomeEmail = emailTemplates.newsletterWelcome(validatedData.name || 'Creator');
      await sendEmail({
        to: validatedData.email,
        subject: welcomeEmail.subject,
        html: welcomeEmail.html,
      });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError);
    }

    // Track analytics
    try {
      await prisma.analytics.create({
        data: {
          event: 'newsletter_signup',
          page: '/newsletter',
          data: {
            source: validatedData.source,
            preferences: validatedData.preferences,
          },
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        },
      });
    } catch (analyticsError) {
      console.error('Failed to track analytics:', analyticsError);
    }

    // Notify admin
    try {
      if (process.env.ADMIN_EMAIL) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `📧 New Newsletter Subscription: ${validatedData.name || validatedData.email}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #9d4edd;">New Newsletter Subscription</h2>
              <p><strong>Name:</strong> ${validatedData.name || 'Not provided'}</p>
              <p><strong>Email:</strong> ${validatedData.email}</p>
              <p><strong>Source:</strong> ${validatedData.source || 'website'}</p>
              <p><strong>Preferences:</strong> ${JSON.stringify(validatedData.preferences || {}, null, 2)}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            </div>
          `,
        });
      }
    } catch (adminEmailError) {
      console.error('Failed to send admin notification:', adminEmailError);
    }

    return successResponse(
      { 
        id: subscription.id,
        email: subscription.email,
        preferences: subscription.preferences
      },
      '🌟 Thank you for subscribing! You\'ll receive monthly updates on our platform development and AI gaming insights.'
    );

  } catch (error) {
    console.error('Newsletter API error:', error);
    
    if (error instanceof z.ZodError) {
      return errorResponse(
        `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }

    return errorResponse('Failed to subscribe to newsletter. Please try again.', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const isActive = searchParams.get('active');
    
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    // Get newsletters with pagination
    const [newsletters, total] = await Promise.all([
      prisma.newsletter.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          preferences: true,
          source: true,
          createdAt: true,
        },
      }),
      prisma.newsletter.count({ where }),
    ]);

    return successResponse({
      newsletters,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        active: await prisma.newsletter.count({ where: { isActive: true } }),
        inactive: await prisma.newsletter.count({ where: { isActive: false } }),
      },
    });

  } catch (error) {
    console.error('Newsletter GET error:', error);
    return errorResponse('Failed to retrieve newsletter subscriptions', 500);
  }
}

// Unsubscribe (DELETE method)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const token = searchParams.get('token');

    if (!email) {
      return errorResponse('Email parameter is required', 400);
    }

    if (!validators.email(email)) {
      return errorResponse('Invalid email format', 400);
    }

    // For security, you might want to implement a token-based unsubscribe
    // For now, we'll allow direct unsubscribe by email

    const unsubscribed = await prisma.newsletter.updateMany({
      where: { 
        email,
        isActive: true
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    if (unsubscribed.count === 0) {
      return errorResponse('Email not found or already unsubscribed', 404);
    }

    // Send confirmation email
    try {
      await sendEmail({
        to: email,
        subject: '📧 Unsubscribed from XEUR.AI Newsletter',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #1a0b2e; color: white; padding: 40px 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #39ff14; font-size: 28px; margin: 0;">XEUR.AI</h1>
            </div>
            
            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 15px; padding: 30px; text-center;">
              <h2 style="color: #9d4edd; margin-top: 0;">You've been unsubscribed</h2>
              
              <p>We're sorry to see you go! You have been successfully unsubscribed from the XEUR.AI newsletter.</p>
              
              <p>If you change your mind, you can always subscribe again at <a href="https://xeur.ai" style="color: #39ff14;">xeur.ai</a></p>
              
              <p>Thank you for being part of our journey to revolutionize game creation.</p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #9d4edd; font-style: italic;">Made in India 🇮🇳 for the World 🌍</p>
            </div>
          </div>
        `,
      });
    } catch (emailError) {
      console.error('Failed to send unsubscribe confirmation:', emailError);
    }

    // Track analytics
    try {
      await prisma.analytics.create({
        data: {
          event: 'newsletter_unsubscribe',
          page: '/unsubscribe',
          data: { email },
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        },
      });
    } catch (analyticsError) {
      console.error('Failed to track analytics:', analyticsError);
    }

    return successResponse(
      { email, unsubscribed: true },
      'You have been successfully unsubscribed from our newsletter.'
    );

  } catch (error) {
    console.error('Newsletter DELETE error:', error);
    return errorResponse('Failed to unsubscribe from newsletter', 500);
  }
}

// Update preferences (PATCH method)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, preferences, name, isActive } = body;

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    const updates: any = { updatedAt: new Date() };
    if (preferences) updates.preferences = preferences;
    if (name !== undefined) updates.name = name;
    if (isActive !== undefined) updates.isActive = isActive;

    const updatedSubscription = await prisma.newsletter.update({
      where: { email },
      data: updates,
      select: {
        id: true,
        email: true,
        name: true,
        isActive: true,
        preferences: true,
        updatedAt: true,
      },
    });

    return successResponse(
      updatedSubscription, 
      'Newsletter preferences updated successfully'
    );

  } catch (error) {
    console.error('Newsletter PATCH error:', error);
    
    if (error.code === 'P2025') {
      return errorResponse('Newsletter subscription not found', 404);
    }

    return errorResponse('Failed to update newsletter preferences', 500);
  }
}