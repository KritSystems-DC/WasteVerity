import { prisma } from './prisma'

export async function sendEmail(to: string, subject: string, body: string, businessId?: string) {
  console.log(`sendEmail: to=${to} subject=${subject}`)
  await prisma.automationLog.create({ data: { businessId, type: 'email', title: subject, message: body, status: 'SUCCESS' } })
}

export async function sendSMS(to: string, message: string, businessId?: string) {
  console.log(`sendSMS placeholder: to=${to} msg=${message}`)
  await prisma.automationLog.create({ data: { businessId, type: 'sms', title: 'SMS placeholder', message, status: 'INFO' } })
}

export async function sendWhatsApp(to: string, message: string, businessId?: string) {
  console.log(`sendWhatsApp placeholder: to=${to} msg=${message}`)
  await prisma.automationLog.create({ data: { businessId, type: 'whatsapp', title: 'WhatsApp placeholder', message, status: 'INFO' } })
}
