import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { successResponse, errorResponse } from '@/lib/utils';
import { z } from 'zod';

// Validation schema for analytics events
const analyticsSchema = z.object({
  event: z.string().min(1, 'Event name is required'),
  page: z.string().optional(),
  data: z.record(z.any()).optional(),
  sessionId: z.string().optional(),
  userId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = analyticsSchema.parse(body);
    
    // Create analytics entry
    const analyticsEntry = await prisma.analytics.create({
      data: {
        event: validatedData.event,
        page: validatedData.page,
        data: validatedData.data || {},
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        timestamp: new Date(),
      },
    });

    return successResponse(
      { 
        id: analyticsEntry.id,
        event: analyticsEntry.event,
        timestamp: analyticsEntry.timestamp
      },
      'Analytics event tracked successfully'
    );

  } catch (error) {
    console.error('Analytics API error:', error);
    
    if (error instanceof z.ZodError) {
      return errorResponse(
        `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }

    return errorResponse('Failed to track analytics event', 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const event = searchParams.get('event');
    const page = searchParams.get('page');
    const limit = parseInt(searchParams.get('limit') || '100');
    const groupBy = searchParams.get('groupBy'); // 'event', 'page', 'hour', 'day'

    // Build date filter
    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate);
    if (endDate) dateFilter.lte = new Date(endDate);

    // Build where clause
    const where: any = {};
    if (Object.keys(dateFilter).length > 0) where.timestamp = dateFilter;
    if (event) where.event = event;
    if (page) where.page = page;

    // Handle different query types
    if (groupBy) {
      let groupByClause: any;
      let selectClause: any;

      switch (groupBy) {
        case 'event':
          const eventStats = await prisma.analytics.groupBy({
            by: ['event'],
            where,
            _count: { event: true },
            orderBy: { _count: { event: 'desc' } },
            take: limit,
          });
          
          return successResponse({
            type: 'event_stats',
            data: eventStats.map(stat => ({
              event: stat.event,
              count: stat._count.event,
            })),
          });

        case 'page':
          const pageStats = await prisma.analytics.groupBy({
            by: ['page'],
            where,
            _count: { page: true },
            orderBy: { _count: { page: 'desc' } },
            take: limit,
          });
          
          return successResponse({
            type: 'page_stats',
            data: pageStats.map(stat => ({
              page: stat.page,
              count: stat._count.page,
            })),
          });

        case 'day':
          // Get daily analytics using raw SQL for better date handling
          const dailyStats = await prisma.$queryRaw`
            SELECT 
              DATE(timestamp) as date,
              COUNT(*) as count,
              COUNT(DISTINCT "ipAddress") as unique_visitors
            FROM "analytics"
            ${where.timestamp ? `WHERE timestamp >= ${where.timestamp.gte} AND timestamp <= ${where.timestamp.lte}` : ''}
            GROUP BY DATE(timestamp)
            ORDER BY date DESC
            LIMIT ${limit}
          `;
          
          return successResponse({
            type: 'daily_stats',
            data: dailyStats,
          });

        case 'hour':
          const hourlyStats = await prisma.$queryRaw`
            SELECT 
              DATE_TRUNC('hour', timestamp) as hour,
              COUNT(*) as count,
              COUNT(DISTINCT "ipAddress") as unique_visitors
            FROM "analytics"
            ${where.timestamp ? `WHERE timestamp >= ${where.timestamp.gte} AND timestamp <= ${where.timestamp.lte}` : ''}
            GROUP BY DATE_TRUNC('hour', timestamp)
            ORDER BY hour DESC
            LIMIT ${limit}
          `;
          
          return successResponse({
            type: 'hourly_stats',
            data: hourlyStats,
          });

        default:
          return errorResponse('Invalid groupBy parameter', 400);
      }
    }

    // Default: return raw analytics events
    const [events, total] = await Promise.all([
      prisma.analytics.findMany({
        where,
        take: limit,
        orderBy: { timestamp: 'desc' },
        select: {
          id: true,
          event: true,
          page: true,
          data: true,
          userAgent: true,
          timestamp: true,
        },
      }),
      prisma.analytics.count({ where }),
    ]);

    return successResponse({
      type: 'raw_events',
      events,
      total,
      filters: { startDate, endDate, event, page },
    });

  } catch (error) {
    console.error('Analytics GET error:', error);
    return errorResponse('Failed to retrieve analytics data', 500);
  }
}

// Get dashboard analytics summary
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get comprehensive analytics summary
    const [
      totalEvents,
      uniqueVisitors,
      topEvents,
      topPages,
      recentActivity,
      conversionMetrics,
      trafficSources,
    ] = await Promise.all([
      // Total events in period
      prisma.analytics.count({
        where: { timestamp: { gte: startDate } }
      }),

      // Unique visitors (approximate by IP)
      prisma.analytics.findMany({
        where: { timestamp: { gte: startDate } },
        select: { ipAddress: true },
        distinct: ['ipAddress'],
      }).then(result => result.length),

      // Top events
      prisma.analytics.groupBy({
        by: ['event'],
        where: { timestamp: { gte: startDate } },
        _count: { event: true },
        orderBy: { _count: { event: 'desc' } },
        take: 10,
      }),

      // Top pages
      prisma.analytics.groupBy({
        by: ['page'],
        where: { 
          timestamp: { gte: startDate },
          page: { not: null }
        },
        _count: { page: true },
        orderBy: { _count: { page: 'desc' } },
        take: 10,
      }),

      // Recent activity (last 24 hours)
      prisma.analytics.count({
        where: {
          timestamp: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),

      // Conversion metrics
      Promise.all([
        prisma.analytics.count({
          where: {
            event: 'waitlist_signup',
            timestamp: { gte: startDate }
          }
        }),
        prisma.analytics.count({
          where: {
            event: 'contact_form_submit',
            timestamp: { gte: startDate }
          }
        }),
        prisma.analytics.count({
          where: {
            event: 'newsletter_signup',
            timestamp: { gte: startDate }
          }
        }),
        prisma.analytics.count({
          where: {
            event: 'investment_inquiry',
            timestamp: { gte: startDate }
          }
        }),
      ]).then(([waitlist, contact, newsletter, investment]) => ({
        waitlist,
        contact,
        newsletter,
        investment,
      })),

      // Traffic sources (from referrer data)
      prisma.analytics.findMany({
        where: {
          timestamp: { gte: startDate },
          data: { path: ['source'] }
        },
        select: { data: true },
        take: 1000, // Limit for performance
      }).then(results => {
        const sources: Record<string, number> = {};
        results.forEach(result => {
          const source = result.data?.source || 'direct';
          sources[source] = (sources[source] || 0) + 1;
        });
        return Object.entries(sources)
          .map(([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 10);
      }),
    ]);

    // Calculate growth rates (compare with previous period)
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - days);

    const [previousEvents, previousVisitors] = await Promise.all([
      prisma.analytics.count({
        where: {
          timestamp: {
            gte: previousStartDate,
            lt: startDate
          }
        }
      }),
      prisma.analytics.findMany({
        where: {
          timestamp: {
            gte: previousStartDate,
            lt: startDate
          }
        },
        select: { ipAddress: true },
        distinct: ['ipAddress'],
      }).then(result => result.length),
    ]);

    const eventGrowth = previousEvents > 0 
      ? ((totalEvents - previousEvents) / previousEvents) * 100 
      : 0;
    
    const visitorGrowth = previousVisitors > 0 
      ? ((uniqueVisitors - previousVisitors) / previousVisitors) * 100 
      : 0;

    return successResponse({
      period: `${days} days`,
      summary: {
        totalEvents,
        uniqueVisitors,
        recentActivity,
        eventGrowth: Math.round(eventGrowth * 100) / 100,
        visitorGrowth: Math.round(visitorGrowth * 100) / 100,
      },
      topEvents: topEvents.map(e => ({
        event: e.event,
        count: e._count.event,
      })),
      topPages: topPages.map(p => ({
        page: p.page,
        count: p._count.page,
      })),
      conversions: conversionMetrics,
      trafficSources,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Analytics dashboard error:', error);
    return errorResponse('Failed to generate analytics dashboard', 500);
  }
}

// Batch analytics tracking (for performance)
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { events } = body;

    if (!Array.isArray(events) || events.length === 0) {
      return errorResponse('Events array is required', 400);
    }

    if (events.length > 100) {
      return errorResponse('Maximum 100 events per batch', 400);
    }

    // Validate each event
    const validatedEvents = events.map(event => {
      const validated = analyticsSchema.parse(event);
      return {
        event: validated.event,
        page: validated.page,
        data: validated.data || {},
        userAgent: request.headers.get('user-agent'),
        ipAddress: request.headers.get('x-forwarded-for') || 
                   request.headers.get('x-real-ip') || 
                   'unknown',
        timestamp: new Date(),
      };
    });

    // Batch insert
    const result = await prisma.analytics.createMany({
      data: validatedEvents,
    });

    return successResponse(
      { 
        created: result.count,
        events: validatedEvents.length
      },
      `Successfully tracked ${result.count} analytics events`
    );

  } catch (error) {
    console.error('Analytics batch error:', error);
    
    if (error instanceof z.ZodError) {
      return errorResponse(
        `Validation error: ${error.errors.map(e => e.message).join(', ')}`,
        400
      );
    }

    return errorResponse('Failed to track batch analytics events', 500);
  }
}