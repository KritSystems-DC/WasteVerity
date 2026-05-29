"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { StockStatus, AlertStatus, MovementType, ReorderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

// AUTH ACTIONS
export async function registerUser(email: string, name: string, password: string) {
  try {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("User already exists");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, name, passwordHash, role: "OWNER" },
    });

    return { success: true, user };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// BUSINESS ACTIONS
export async function createBusiness(data: {
  name: string;
  type: string;
  email: string;
  phone?: string;
  country?: string;
  currency?: string;
  timezone?: string;
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const business = await prisma.business.create({
      data: {
        ...data,
        ownerId: session.user.id,
        currency: data.currency || "GBP",
        timezone: data.timezone || "Europe/London",
        users: { connect: { id: session.user.id } },
      },
    });

    await prisma.subscription.create({
      data: {
        businessId: business.id,
        stripeCustomerId: `cus_${Date.now()}`,
      },
    });

    return business;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateBusiness(businessId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    return await prisma.business.update({ where: { id: businessId }, data });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function completeBusinessSetup(businessId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    return await prisma.business.update({
      where: { id: businessId },
      data: { setupCompleted: true, status: "ACTIVE" },
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// STOCK ACTIONS
export async function createStockItem(businessId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    return await prisma.stockItem.create({
      data: { ...data, businessId },
      include: { supplier: true },
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateStockItem(itemId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    return await prisma.stockItem.update({
      where: { id: itemId },
      data,
      include: { supplier: true },
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function adjustStockQuantity(
  itemId: string,
  quantityChange: number,
  reason: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const item = await prisma.stockItem.findUnique({ where: { id: itemId } });
    if (!item) throw new Error("Item not found");

    const newQuantity = Math.max(0, item.currentQuantity + quantityChange);

    await prisma.stockMovement.create({
      data: {
        businessId: item.businessId,
        stockItemId: itemId,
        userId: session.user.id,
        type: "MANUAL_ADJUSTMENT",
        quantityChange,
        previousQuantity: item.currentQuantity,
        newQuantity,
        reason,
      },
    });

    return await prisma.stockItem.update({
      where: { id: itemId },
      data: { currentQuantity: newQuantity },
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function archiveStockItem(itemId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    return await prisma.stockItem.update({
      where: { id: itemId },
      data: { status: StockStatus.ARCHIVED },
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// SUPPLIER ACTIONS
export async function createSupplier(businessId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    return await prisma.supplier.create({
      data: { ...data, businessId },
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateSupplier(supplierId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    return await prisma.supplier.update({
      where: { id: supplierId },
      data,
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function deleteSupplier(supplierId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    return await prisma.supplier.delete({ where: { id: supplierId } });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// STAFF REQUEST ACTIONS
export async function createStaffRequest(businessId: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    return await prisma.staffRequest.create({
      data: {
        ...data,
        businessId,
        submittedByUserId: session.user.id,
      },
      include: { submittedByUser: true, stockItem: true },
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function approveStaffRequest(requestId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const request = await prisma.staffRequest.findUnique({
      where: { id: requestId },
    });
    if (!request) throw new Error("Request not found");

    await prisma.staffRequest.update({
      where: { id: requestId },
      data: {
        status: "APPROVED",
        reviewedByUserId: session.user.id,
        reviewedAt: new Date(),
      },
    });

    if (request.stockItemId) {
      await prisma.stockItem.update({
        where: { id: request.stockItemId },
        data: { currentQuantity: { increment: request.requestedQuantity } },
      });
    }

    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function rejectStaffRequest(requestId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    await prisma.staffRequest.update({
      where: { id: requestId },
      data: {
        status: "REJECTED",
        reviewedByUserId: session.user.id,
        reviewedAt: new Date(),
      },
    });

    return { success: true };
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// WASTE RECORD ACTIONS
export async function recordWaste(
  businessId: string,
  stockItemId: string,
  quantity: number,
  reason: string
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    const item = await prisma.stockItem.findUnique({
      where: { id: stockItemId },
    });
    if (!item) throw new Error("Item not found");

    const waste = await prisma.wasteRecord.create({
      data: {
        businessId,
        stockItemId,
        userId: session.user.id,
        quantity,
        reason,
        estimatedCostLost: Number(item.costPerUnit) * quantity,
      },
    });

    await prisma.stockMovement.create({
      data: {
        businessId,
        stockItemId,
        userId: session.user.id,
        type: MovementType.WASTED,
        quantityChange: -quantity,
        previousQuantity: item.currentQuantity,
        newQuantity: Math.max(0, item.currentQuantity - quantity),
        reason,
      },
    });

    await prisma.stockItem.update({
      where: { id: stockItemId },
      data: { currentQuantity: Math.max(0, item.currentQuantity - quantity) },
    });

    return waste;
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// REORDER LIST ACTIONS
export async function createReorderList(businessId: string, itemIds: string[]) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    let totalCost = 0;
    const items = [];

    for (const itemId of itemIds) {
      const item = await prisma.stockItem.findUnique({
        where: { id: itemId },
      });
      if (item) {
        const cost = Number(item.costPerUnit) * item.reorderAmount;
        totalCost += cost;
        items.push({
          stockItemId: itemId,
          supplierId: item.supplierId,
          quantity: item.reorderAmount,
          unit: item.unit,
          estimatedCost: cost,
        });
      }
    }

    return await prisma.reorderList.create({
      data: {
        businessId,
        createdByUserId: session.user.id,
        title: `Reorder - ${new Date().toLocaleDateString()}`,
        estimatedTotalCost: totalCost,
        items: { createMany: { data: items } },
      },
      include: { items: { include: { stockItem: true, supplier: true } } },
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

export async function updateReorderListStatus(
  reorderListId: string,
  status: ReorderStatus
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    return await prisma.reorderList.update({
      where: { id: reorderListId },
      data: { status },
    });
  } catch (error: any) {
    throw new Error(error.message);
  }
}

// ALERT ACTIONS
export async function resolveAlert(
  alertId: string,
  alertType: "LOW_STOCK" | "EXPIRY"
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("Unauthorized");

  try {
    if (alertType === "LOW_STOCK") {
      return await prisma.lowStockAlert.update({
        where: { id: alertId },
        data: { status: AlertStatus.RESOLVED, resolvedAt: new Date() },
      });
    } else {
      return await prisma.expiryAlert.update({
        where: { id: alertId },
        data: { status: AlertStatus.RESOLVED, resolvedAt: new Date() },
      });
    }
  } catch (error: any) {
    throw new Error(error.message);
  }
}
