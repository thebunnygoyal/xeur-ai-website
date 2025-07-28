import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, emailTemplates } from '@/lib/email';
import { successResponse, errorResponse, validators } from '@/lib/utils';
import { z } from 'zod';

// Validation schema
const waitlistSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').optional(),
  gameTypes: z.string().min(1, 'Please select at least one game type'),
  experience: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL']).default('BEGINNER'),
  source: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = waitlistSchema.parse(body);
    
    // Check if email already exists
    const existingEntry = await prisma.waitlistEntry.findUnique({
      where: { email: validatedData.email }
    });

    if (existingEntry) {
      return errorResponse('Email already registered for waitlist', 409);
    }

    // Convert gameTypes string to array
    const gameTypesArray = validatedData.gameTypes.split(',').map(type => type.trim());

    // Create waitlist entry
    const waitlistEntry = await prisma.waitlistEntry.create({
      data: {
        email: validatedData.email,
        name: validatedData.name,
        gameTypes: gameTypesArray,
        experience: validatedData.experience as any,
        source: validatedData.source || 'website',
        priority: 0, // Default priority
      },
    });

    // Send confirmation email
    try {
      const emailTemplate = emailTemplates.waitlistConfirmation(validatedData.name || 'Creator');
      await sendEmail({
        to: validatedData.email,
        subject: emailTemplate.subject,
        html: emailTemplate.html,
      });
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the API call if email fails
    }

    // Track analytics
    try {
      await prisma.analytics.create({
        data: {
          event: 'waitlist_signup',
          page: '/waitlist',
          data: {
            gameTypes: gameTypesArray,
            experience: validatedData.experience,
            source: validatedData.source,
          },
          userAgent: request.headers.get('user-agent'),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        },
      });
    } catch (analyticsError) {
      console.error('Failed to track analytics:', analyticsError);
      // Don't fail the API call if analytics fails
    }

    // Notify admin (optional)
    try {
      if (process.env.ADMIN_EMAIL) {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject: `🎮 New Waitlist Signup: ${validatedData.name || validatedData.email}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h2 style="color: #9d4edd;">New Waitlist Signup</h2>
              <p><strong>Name:</strong> ${validatedData.name || 'Not provided'}</p>
              <p><strong>Email:</strong> ${validatedData.email}</p>
              <p><strong>Game Types:</strong> ${gameTypesArray.join(', ')}</p>
              <p><strong>Experience:</strong> ${validatedData.experience}</p>
              <p><strong>Source:</strong> ${validatedData.source || 'website'}</p>
              <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
            </div>
          `,
        });
      }
    } catch (adminEmailError) {
      console.error('Failed to send admin notification:', adminEmailError);
      // Don't fail the API call if admin email fails
    }

    return successResponse(
      { 
        id: waitlistEntry.id,
        email: waitlistEntry.email,
        position: await getWaitlistPosition(waitlistEntry.id)
      },
      '🎮 Welcome to XEUR.AI! Check your email for confirmation details.'
    );

  } catch (error) {
    console.error('Waitlist API error:', error);
    
    if (error instanceof z.ZodError) {
      return errorResponse(
        `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }

    return errorResponse('Failed to join waitlist. Please try again.', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return errorResponse('Email parameter is required', 400);
    }

    if (!validators.email(email)) {
      return errorResponse('Invalid email format', 400);
    }

    // Find waitlist entry
    const entry = await prisma.waitlistEntry.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        createdAt: true,
      },
    });

    if (!entry) {
      return errorResponse('Email not found in waitlist', 404);
    }

    const position = await getWaitlistPosition(entry.id);
    const totalCount = await prisma.waitlistEntry.count();

    return successResponse({
      ...entry,
      position,
      totalCount,
      percentile: Math.round((position / totalCount) * 100),
    });

  } catch (error) {
    console.error('Waitlist GET error:', error);
    return errorResponse('Failed to retrieve waitlist status', 500);
  }
}

// Helper function to get waitlist position
async function getWaitlistPosition(entryId: string): Promise<number> {
  const entry = await prisma.waitlistEntry.findUnique({
    where: { id: entryId },
    select: { createdAt: true, priority: true },
  });

  if (!entry) return 0;

  const position = await prisma.waitlistEntry.count({
    where: {
      OR: [
        { priority: { gt: entry.priority } },
        { 
          priority: entry.priority,
          createdAt: { lt: entry.createdAt }
        }
      ]
    }
  });

  return position + 1;
}

// Update waitlist entry (PATCH method)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, ...updates } = body;

    if (!email) {
      return errorResponse('Email is required', 400);
    }

    // Find and update entry
    const updatedEntry = await prisma.waitlistEntry.update({
      where: { email },
      data: {
        ...updates,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        email: true,
        name: true,
        status: true,
        gameTypes: true,
        experience: true,
        updatedAt: true,
      },
    });

    return successResponse(updatedEntry, 'Waitlist entry updated successfully');

  } catch (error) {
    console.error('Waitlist PATCH error:', error);
    
    if (error.code === 'P2025') {
      return errorResponse('Waitlist entry not found', 404);
    }

    return errorResponse('Failed to update waitlist entry', 500);
  }
}