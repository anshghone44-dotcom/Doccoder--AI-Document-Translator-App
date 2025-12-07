import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '@/lib/mongodb';
import DocumentModel from '@/lib/models/Document';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get stats
    const totalDocuments = await DocumentModel.countDocuments({ userId: user.userId });
    const completedDocuments = await DocumentModel.countDocuments({ 
      userId: user.userId, 
      status: 'completed' 
    });
    const failedDocuments = await DocumentModel.countDocuments({ 
      userId: user.userId, 
      status: 'failed' 
    });
    
    const translations = await DocumentModel.countDocuments({ 
      userId: user.userId, 
      operation: 'translate' 
    });
    const summaries = await DocumentModel.countDocuments({ 
      userId: user.userId, 
      operation: 'summarize' 
    });

    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentActivity = await DocumentModel.countDocuments({ 
      userId: user.userId,
      createdAt: { $gte: sevenDaysAgo }
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalDocuments,
        completedDocuments,
        failedDocuments,
        translations,
        summaries,
        recentActivity,
        successRate: totalDocuments > 0 ? Math.round((completedDocuments / totalDocuments) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}