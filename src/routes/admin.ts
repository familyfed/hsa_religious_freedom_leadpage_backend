import { Router, Request, Response } from 'express';
import { db } from '../database/supabase';
import { validateAdminAuth } from '../utils/validation';
import { logger } from '../utils/logger';

const router = Router();

// Apply admin authentication (JWT or API key fallback)
router.use(validateAdminAuth);

// GET /api/admin/signatures.csv?petition=slug
router.get('/signatures.csv', async (req: Request, res: Response): Promise<void> => {
  try {
    const { petition } = req.query;

    if (!petition || typeof petition !== 'string') {
      res.status(400).json({
        ok: false,
        error: 'Petition slug is required'
      });
    }

    logger.info('Admin CSV export request', { petition, adminIp: req.ip });

    const signatures = await db.getSignaturesByPetition(petition as string);

    // Generate CSV
    const csvHeader = 'full_name,email,country,status,created_at,confirmed_at\n';
    const csvRows = signatures.map(sig => 
      `"${sig.full_name}","${sig.email}","${sig.country || ''}","${sig.status}","${sig.created_at}","${sig.confirmed_at || ''}"`
    ).join('\n');

    const csv = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="signatures-${petition}-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);

    logger.info('CSV export completed', { 
      petition, 
      signatureCount: signatures.length,
      adminIp: req.ip 
    });

  } catch (error) {
    logger.error('Error exporting signatures CSV', { error, petition: req.query.petition });
    res.status(500).json({
      ok: false,
      error: 'Could not export signatures'
    });
  }
});

// GET /api/admin/stats?petition=slug
router.get('/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const { petition } = req.query;

    if (!petition || typeof petition !== 'string') {
      res.status(400).json({
        ok: false,
        error: 'Petition slug is required'
      });
    }

    const stats = await db.getPetitionStats(petition as string);
    if (!stats) {
      res.status(404).json({
        ok: false,
        error: 'Petition not found'
      });
    }

    res.status(200).json({
      ok: true,
      data: stats
    });

  } catch (error) {
    logger.error('Error fetching admin stats', { error, petition: req.query.petition });
    res.status(500).json({
      ok: false,
      error: 'Could not fetch stats'
    });
  }
});

export default router;
