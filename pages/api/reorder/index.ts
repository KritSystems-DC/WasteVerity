import { NextApiRequest, NextApiResponse } from 'next'
import { prisma } from '@/lib/prisma'
import { requireUser } from '@/lib/serverAuth'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const user = await requireUser(req, res)
  if (!user) return
  if (!user.businessId) return res.status(403).json({ error: 'Business context required' })

  if (req.method === 'GET') {
    const reorderLists = await prisma.reorderList.findMany({
      where: { businessId: user.businessId },
      include: {
        items: { include: { stockItem: true, supplier: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
    return res.status(200).json(reorderLists)
  }

  return res.status(405).end()
}
