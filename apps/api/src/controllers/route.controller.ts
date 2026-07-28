import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { CreateRouteSchema } from '@bus-pass/shared';

export async function getRoutes(req: Request, res: Response) {
  try {
    const { source, destination, search } = req.query;

    const whereClause: any = { isActive: true };

    if (source) {
      whereClause.source = { contains: String(source), mode: 'insensitive' };
    }
    if (destination) {
      whereClause.destination = { contains: String(destination), mode: 'insensitive' };
    }
    if (search) {
      whereClause.OR = [
        { routeCode: { contains: String(search), mode: 'insensitive' } },
        { source: { contains: String(search), mode: 'insensitive' } },
        { destination: { contains: String(search), mode: 'insensitive' } }
      ];
    }

    const routes = await prisma.route.findMany({
      where: whereClause,
      orderBy: { routeCode: 'asc' }
    });

    return res.status(200).json({
      success: true,
      data: routes
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch routes.' });
  }
}

export async function getRouteById(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const route = await prisma.route.findUnique({ where: { id } });

    if (!route) {
      return res.status(404).json({ success: false, message: 'Route not found.' });
    }

    return res.status(200).json({ success: true, data: route });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function createRoute(req: Request, res: Response) {
  try {
    const validated = CreateRouteSchema.parse(req.body);

    const existing = await prisma.route.findUnique({ where: { routeCode: validated.routeCode } });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Route code already exists.' });
    }

    const route = await prisma.route.create({
      data: validated
    });

    return res.status(201).json({
      success: true,
      message: 'Route created successfully.',
      data: route
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to create route.' });
  }
}

export async function updateRoute(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const route = await prisma.route.update({
      where: { id },
      data: req.body
    });

    return res.status(200).json({
      success: true,
      message: 'Route updated successfully.',
      data: route
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to update route.' });
  }
}

export async function deleteRoute(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    await prisma.route.delete({ where: { id } });

    return res.status(200).json({
      success: true,
      message: 'Route deleted successfully.'
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to delete route.' });
  }
}
