import { prisma } from "./prisma";
import { StockStatus, AlertStatus, RequestStatus, ReorderStatus } from "@prisma/client";

export async function getBusinessWithUser(businessId: string, userId: string) {
  return prisma.business.findFirst({
    where: {
      id: businessId,
      users: {
        some: {
          id: userId,
        },
      },
    },
  });
}

export async function getStockItemsForBusiness(businessId: string) {
  return prisma.stockItem.findMany({
    where: {
      businessId,
      status: StockStatus.ACTIVE,
    },
    include: {
      supplier: true,
      movements: {
        take: 5,
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

export async function getLowStockItems(businessId: string) {
  return prisma.stockItem.findMany({
    where: {
      businessId,
      status: StockStatus.ACTIVE,
    },
  }).then(items => 
    items.filter(item => item.currentQuantity <= item.minimumQuantity)
  );
}

export async function getExpiringItems(businessId: string, daysThreshold: number = 30) {
  const today = new Date();
  const threshold = new Date(today.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

  return prisma.stockItem.findMany({
    where: {
      businessId,
      status: StockStatus.ACTIVE,
      expiryDate: {
        lte: threshold,
        gte: today,
      },
    },
    orderBy: {
      expiryDate: "asc",
    },
  });
}

export async function getExpiredItems(businessId: string) {
  const today = new Date();
  return prisma.stockItem.findMany({
    where: {
      businessId,
      status: StockStatus.ACTIVE,
      expiryDate: {
        lt: today,
      },
    },
  });
}

export async function createLowStockAlerts(businessId: string) {
  const lowStockItems = await getLowStockItems(businessId);

  for (const item of lowStockItems) {
    const existingAlert = await prisma.lowStockAlert.findFirst({
      where: {
        businessId,
        stockItemId: item.id,
        status: AlertStatus.ACTIVE,
      },
    });

    if (!existingAlert) {
      await prisma.lowStockAlert.create({
        data: {
          businessId,
          stockItemId: item.id,
          message: `${item.name} is running low (${item.currentQuantity}/${item.minimumQuantity})`,
        },
      });
    }
  }
}

export async function createExpiryAlerts(businessId: string) {
  const expiringItems = await getExpiringItems(businessId);

  for (const item of expiringItems) {
    if (item.expiryDate) {
      const existingAlert = await prisma.expiryAlert.findFirst({
        where: {
          businessId,
          stockItemId: item.id,
          status: AlertStatus.ACTIVE,
        },
      });

      if (!existingAlert) {
        await prisma.expiryAlert.create({
          data: {
            businessId,
            stockItemId: item.id,
            expiryDate: item.expiryDate,
          },
        });
      }
    }
  }
}

export async function generateReorderList(businessId: string, userId: string) {
  const lowStockItems = await getLowStockItems(businessId);

  if (lowStockItems.length === 0) {
    return null;
  }

  let totalCost = 0;
  const items = [];

  for (const item of lowStockItems) {
    const quantityToOrder = item.reorderAmount;
    const estimatedCost = Number(item.costPerUnit) * quantityToOrder;
    totalCost += estimatedCost;

    items.push({
      stockItemId: item.id,
      supplierId: item.supplierId,
      quantity: quantityToOrder,
      unit: item.unit,
      estimatedCost,
    });
  }

  const reorderList = await prisma.reorderList.create({
    data: {
      businessId,
      createdByUserId: userId,
      title: `Auto-generated reorder - ${new Date().toLocaleDateString()}`,
      estimatedTotalCost: totalCost,
      items: {
        createMany: {
          data: items,
        },
      },
    },
    include: {
      items: {
        include: {
          stockItem: true,
          supplier: true,
        },
      },
    },
  });

  return reorderList;
}

export async function getStaffRequestsForBusiness(businessId: string) {
  return prisma.staffRequest.findMany({
    where: {
      businessId,
      status: RequestStatus.PENDING,
    },
    include: {
      submittedByUser: true,
      stockItem: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
}

export async function approveStaffRequest(requestId: string, reviewedByUserId: string) {
  const request = await prisma.staffRequest.update({
    where: { id: requestId },
    data: {
      status: RequestStatus.APPROVED,
      reviewedByUserId,
      reviewedAt: new Date(),
    },
  });

  if (request.stockItemId) {
    await prisma.stockItem.update({
      where: { id: request.stockItemId },
      data: {
        currentQuantity: {
          increment: request.requestedQuantity,
        },
      },
    });
  }

  return request;
}

export async function getBusinessStats(businessId: string) {
  const [totalStockItems, lowStockCount, expiringCount, wasteCount, staffRequests, totalSuppliers] = await Promise.all([
    prisma.stockItem.count({
      where: {
        businessId,
        status: StockStatus.ACTIVE,
      },
    }),
    prisma.stockItem.count({
      where: {
        businessId,
        status: StockStatus.ACTIVE,
      },
    }).then(async () => {
      const items = await getLowStockItems(businessId);
      return items.length;
    }),
    prisma.expiryAlert.count({
      where: {
        businessId,
        status: AlertStatus.ACTIVE,
      },
    }),
    prisma.wasteRecord.count({
      where: {
        businessId,
      },
    }),
    prisma.staffRequest.count({
      where: {
        businessId,
        status: RequestStatus.PENDING,
      },
    }),
    prisma.supplier.count({
      where: {
        businessId,
      },
    }),
  ]);

  return {
    totalStockItems,
    lowStockCount,
    expiringCount,
    wasteCount,
    staffRequests,
    totalSuppliers,
  };
}

export async function getTotalStockValue(businessId: string): Promise<number> {
  const items = await prisma.stockItem.findMany({
    where: {
      businessId,
      status: StockStatus.ACTIVE,
    },
  });

  return items.reduce((total, item) => {
    return total + (Number(item.costPerUnit) * item.currentQuantity);
  }, 0);
}
