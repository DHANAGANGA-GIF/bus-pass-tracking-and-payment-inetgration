import { Request, Response } from 'express';
import { prisma } from '../config/db.js';
import { CreateRouteSchema } from '@bus-pass/shared';

function parseViaStops(route: any) {
  if (!route) return route;
  let stops = route.viaStops;
  if (typeof stops === 'string') {
    try {
      stops = JSON.parse(stops);
    } catch {
      stops = stops.split(',').map((s: string) => s.trim());
    }
  }
  return { ...route, viaStops: stops };
}

export async function getRoutes(req: Request, res: Response) {
  try {
    const { source, destination, search } = req.query;

    const whereClause: any = { isActive: true };

    if (source) {
      whereClause.source = { contains: String(source) };
    }
    if (destination) {
      whereClause.destination = { contains: String(destination) };
    }
    if (search) {
      whereClause.OR = [
        { routeCode: { contains: String(search) } },
        { source: { contains: String(search) } },
        { destination: { contains: String(search) } }
      ];
    }

    const routes = await prisma.route.findMany({
      where: whereClause,
      orderBy: { routeCode: 'asc' }
    });

    return res.status(200).json({
      success: true,
      data: routes.map(parseViaStops)
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

    return res.status(200).json({ success: true, data: parseViaStops(route) });
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
      data: {
        ...validated,
        viaStops: Array.isArray(validated.viaStops) ? JSON.stringify(validated.viaStops) : String(validated.viaStops)
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Route created successfully.',
      data: parseViaStops(route)
    });
  } catch (error: any) {
    return res.status(400).json({ success: false, message: error.message || 'Failed to create route.' });
  }
}

export async function updateRoute(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const updateData = { ...req.body };
    if (updateData.viaStops && Array.isArray(updateData.viaStops)) {
      updateData.viaStops = JSON.stringify(updateData.viaStops);
    }
    const route = await prisma.route.update({
      where: { id },
      data: updateData
    });

    return res.status(200).json({
      success: true,
      message: 'Route updated successfully.',
      data: parseViaStops(route)
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
