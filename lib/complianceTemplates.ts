export type ComplianceTemplateCategory =
  | 'Food safety'
  | 'Allergens'
  | 'Stock control'
  | 'Waste'
  | 'Suppliers'
  | 'People'
  | 'Governance'

export interface ComplianceTemplateField {
  label: string
  type: 'text' | 'number' | 'date' | 'time' | 'select' | 'checkbox' | 'textarea' | 'signature'
  required?: boolean
  options?: string[]
}

export interface ComplianceTemplate {
  id: string
  title: string
  category: ComplianceTemplateCategory
  cadence: string
  owner: string
  purpose: string
  evidence: string[]
  fields: ComplianceTemplateField[]
}

export const complianceTemplates: ComplianceTemplate[] = [
  {
    id: 'haccp-food-safety-plan',
    title: 'HACCP / Food Safety Plan',
    category: 'Food safety',
    cadence: 'Reviewed at setup, menu change, supplier change, and at least annually',
    owner: 'Kitchen manager',
    purpose: 'Records site-specific food hazards, controls, checks, corrective actions, and review dates.',
    evidence: ['Signed plan', 'Hazard controls', 'Corrective action history', 'Review log'],
    fields: [
      { label: 'Site / service name', type: 'text', required: true },
      { label: 'Food process or menu area', type: 'text', required: true },
      { label: 'Hazard identified', type: 'textarea', required: true },
      { label: 'Control measure', type: 'textarea', required: true },
      { label: 'Critical limit or standard', type: 'text', required: true },
      { label: 'Monitoring method', type: 'textarea', required: true },
      { label: 'Corrective action if failed', type: 'textarea', required: true },
      { label: 'Responsible role', type: 'text', required: true },
      { label: 'Review date', type: 'date', required: true },
      { label: 'Manager sign-off', type: 'signature', required: true },
    ],
  },
  {
    id: 'daily-kitchen-checks',
    title: 'Daily Kitchen Opening / Closing Checks',
    category: 'Food safety',
    cadence: 'Daily',
    owner: 'Shift lead',
    purpose: 'Confirms the kitchen is safe to operate and exceptions are escalated.',
    evidence: ['Opening checks', 'Closing checks', 'Exception notes', 'Manager review'],
    fields: [
      { label: 'Date', type: 'date', required: true },
      { label: 'Shift', type: 'select', required: true, options: ['Opening', 'Midday', 'Closing'] },
      { label: 'Fridge and freezer checks completed', type: 'checkbox', required: true },
      { label: 'Probe available and clean', type: 'checkbox', required: true },
      { label: 'Cleaning supplies available', type: 'checkbox', required: true },
      { label: 'Handwash supplies available', type: 'checkbox', required: true },
      { label: 'No pest activity observed', type: 'checkbox', required: true },
      { label: 'Waste removed safely', type: 'checkbox', required: true },
      { label: 'Exceptions / action required', type: 'textarea' },
      { label: 'Completed by', type: 'signature', required: true },
    ],
  },
  {
    id: 'temperature-log',
    title: 'Fridge / Freezer Temperature Log',
    category: 'Food safety',
    cadence: 'At least daily, or per local procedure',
    owner: 'Kitchen staff',
    purpose: 'Tracks storage temperatures and failed-reading corrective actions.',
    evidence: ['Temperature readings', 'Equipment identifier', 'Corrective action notes'],
    fields: [
      { label: 'Date', type: 'date', required: true },
      { label: 'Time', type: 'time', required: true },
      { label: 'Equipment name / ID', type: 'text', required: true },
      { label: 'Equipment type', type: 'select', required: true, options: ['Fridge', 'Freezer', 'Hot hold', 'Chilled display'] },
      { label: 'Temperature reading', type: 'number', required: true },
      { label: 'Within accepted range', type: 'checkbox', required: true },
      { label: 'Corrective action if outside range', type: 'textarea' },
      { label: 'Checked by', type: 'signature', required: true },
    ],
  },
  {
    id: 'delivery-intake',
    title: 'Food Delivery Intake Log',
    category: 'Suppliers',
    cadence: 'Every delivery',
    owner: 'Receiving staff',
    purpose: 'Records accepted and rejected deliveries, temperatures, packaging condition, and expiry checks.',
    evidence: ['Supplier', 'Item condition', 'Temperature', 'Accepted/rejected status'],
    fields: [
      { label: 'Delivery date', type: 'date', required: true },
      { label: 'Delivery time', type: 'time', required: true },
      { label: 'Supplier', type: 'text', required: true },
      { label: 'Items / invoice reference', type: 'textarea', required: true },
      { label: 'Temperature where applicable', type: 'number' },
      { label: 'Packaging intact', type: 'checkbox', required: true },
      { label: 'Use-by dates checked', type: 'checkbox', required: true },
      { label: 'Allergen information received where needed', type: 'checkbox' },
      { label: 'Decision', type: 'select', required: true, options: ['Accepted', 'Part accepted', 'Rejected'] },
      { label: 'Rejection / issue notes', type: 'textarea' },
      { label: 'Received by', type: 'signature', required: true },
    ],
  },
  {
    id: 'allergen-matrix',
    title: 'Allergen Matrix',
    category: 'Allergens',
    cadence: 'Every menu, recipe, or supplier change',
    owner: 'Menu owner',
    purpose: 'Maps dishes and ingredients to the UK 14 allergens and cross-contamination notes.',
    evidence: ['Dish allergen profile', 'Ingredient source', 'Review date'],
    fields: [
      { label: 'Menu item', type: 'text', required: true },
      { label: 'Ingredients', type: 'textarea', required: true },
      { label: 'Contains allergens', type: 'textarea', required: true },
      { label: 'May contain / cross-contamination risk', type: 'textarea' },
      { label: 'Supplier source', type: 'text' },
      { label: 'Suitable for special diets', type: 'textarea' },
      { label: 'Last checked date', type: 'date', required: true },
      { label: 'Checked by', type: 'signature', required: true },
    ],
  },
  {
    id: 'ppds-label',
    title: 'PPDS / Natasha Law Label',
    category: 'Allergens',
    cadence: 'For each prepacked for direct sale product',
    owner: 'Production lead',
    purpose: 'Captures label information for products prepared and packed before customer selection.',
    evidence: ['Product name', 'Full ingredients', 'Emphasised allergens', 'Use-by date'],
    fields: [
      { label: 'Product name', type: 'text', required: true },
      { label: 'Full ingredients list', type: 'textarea', required: true },
      { label: 'Allergens emphasised in ingredients', type: 'checkbox', required: true },
      { label: 'Prepared date', type: 'date', required: true },
      { label: 'Use-by date', type: 'date', required: true },
      { label: 'Storage instruction', type: 'text' },
      { label: 'Label checked by', type: 'signature', required: true },
    ],
  },
  {
    id: 'cleaning-schedule',
    title: 'Cleaning Schedule',
    category: 'Food safety',
    cadence: 'Daily, weekly, and monthly according to area',
    owner: 'Kitchen manager',
    purpose: 'Defines what must be cleaned, how often, by whom, and with which approved product.',
    evidence: ['Completed clean', 'Area/equipment', 'Product used', 'Exception notes'],
    fields: [
      { label: 'Area / equipment', type: 'text', required: true },
      { label: 'Frequency', type: 'select', required: true, options: ['After use', 'Daily', 'Weekly', 'Monthly'] },
      { label: 'Cleaning product / method', type: 'text', required: true },
      { label: 'COSHH reference', type: 'text' },
      { label: 'Completed date', type: 'date', required: true },
      { label: 'Completed by', type: 'signature', required: true },
      { label: 'Issues found', type: 'textarea' },
    ],
  },
  {
    id: 'waste-log',
    title: 'Waste Log',
    category: 'Waste',
    cadence: 'When food is discarded',
    owner: 'Kitchen staff',
    purpose: 'Tracks avoidable loss, expiry issues, overproduction, and cost impact.',
    evidence: ['Item', 'Quantity', 'Reason', 'Estimated cost', 'Prevention action'],
    fields: [
      { label: 'Date', type: 'date', required: true },
      { label: 'Item', type: 'text', required: true },
      { label: 'Quantity wasted', type: 'number', required: true },
      { label: 'Unit', type: 'text', required: true },
      { label: 'Reason', type: 'select', required: true, options: ['Expired', 'Spoiled', 'Overproduced', 'Damaged', 'Resident preference', 'Other'] },
      { label: 'Estimated cost lost', type: 'number' },
      { label: 'Avoidable', type: 'checkbox' },
      { label: 'Prevention action', type: 'textarea' },
      { label: 'Recorded by', type: 'signature', required: true },
    ],
  },
  {
    id: 'stock-expiry-risk',
    title: 'Stock Rotation / Expiry Risk',
    category: 'Stock control',
    cadence: 'Daily for high-risk stock, weekly for dry stock',
    owner: 'Stores lead',
    purpose: 'Identifies products that need to be used, moved, frozen, donated, or written off.',
    evidence: ['Batch/use-by date', 'Location', 'Risk action', 'Owner'],
    fields: [
      { label: 'Item', type: 'text', required: true },
      { label: 'Batch / delivery reference', type: 'text' },
      { label: 'Storage location', type: 'text', required: true },
      { label: 'Quantity', type: 'number', required: true },
      { label: 'Use-by / best-before date', type: 'date', required: true },
      { label: 'Risk status', type: 'select', required: true, options: ['Normal', 'Use first', 'Urgent', 'Expired'] },
      { label: 'Action required', type: 'textarea' },
      { label: 'Owner', type: 'text', required: true },
    ],
  },
  {
    id: 'supplier-approval',
    title: 'Supplier Approval',
    category: 'Suppliers',
    cadence: 'Before approval and at least annually',
    owner: 'General manager',
    purpose: 'Records whether a supplier is approved for food safety, allergen, and continuity requirements.',
    evidence: ['Approval status', 'Documentation references', 'Review date'],
    fields: [
      { label: 'Supplier name', type: 'text', required: true },
      { label: 'Products supplied', type: 'textarea', required: true },
      { label: 'Contact details', type: 'textarea' },
      { label: 'Food safety documentation checked', type: 'checkbox', required: true },
      { label: 'Allergen data available', type: 'checkbox', required: true },
      { label: 'Insurance / certification reference', type: 'text' },
      { label: 'Approval status', type: 'select', required: true, options: ['Approved', 'Conditional', 'Rejected', 'Under review'] },
      { label: 'Next review date', type: 'date', required: true },
      { label: 'Approved by', type: 'signature', required: true },
    ],
  },
  {
    id: 'incident-corrective-action',
    title: 'Incident / Corrective Action',
    category: 'Governance',
    cadence: 'Every incident or missed control',
    owner: 'Manager on duty',
    purpose: 'Documents food safety incidents, non-conformances, root causes, and completion evidence.',
    evidence: ['Incident detail', 'Immediate action', 'Root cause', 'Close-out sign-off'],
    fields: [
      { label: 'Incident date', type: 'date', required: true },
      { label: 'Incident type', type: 'select', required: true, options: ['Temperature failure', 'Allergen issue', 'Rejected delivery', 'Equipment failure', 'Missed check', 'Complaint', 'Other'] },
      { label: 'What happened', type: 'textarea', required: true },
      { label: 'Immediate action taken', type: 'textarea', required: true },
      { label: 'Root cause', type: 'textarea' },
      { label: 'Prevention action', type: 'textarea', required: true },
      { label: 'Owner', type: 'text', required: true },
      { label: 'Due date', type: 'date' },
      { label: 'Closed date', type: 'date' },
      { label: 'Manager sign-off', type: 'signature', required: true },
    ],
  },
  {
    id: 'staff-training',
    title: 'Staff Food Safety Training Record',
    category: 'People',
    cadence: 'At onboarding and refresher interval',
    owner: 'Registered manager or kitchen manager',
    purpose: 'Shows staff have received role-appropriate food safety and allergen training.',
    evidence: ['Training name', 'Completion date', 'Refresher date', 'Certificate reference'],
    fields: [
      { label: 'Staff member', type: 'text', required: true },
      { label: 'Role', type: 'text', required: true },
      { label: 'Training completed', type: 'text', required: true },
      { label: 'Provider / certificate reference', type: 'text' },
      { label: 'Completion date', type: 'date', required: true },
      { label: 'Refresher due date', type: 'date', required: true },
      { label: 'Manager sign-off', type: 'signature', required: true },
    ],
  },
  {
    id: 'dietary-requirements',
    title: 'Resident / Patient Dietary Requirements',
    category: 'People',
    cadence: 'At admission, care plan change, and scheduled review',
    owner: 'Care lead and catering lead',
    purpose: 'Captures dietary needs that food service teams must follow safely.',
    evidence: ['Allergies', 'Texture needs', 'Cultural needs', 'Review date'],
    fields: [
      { label: 'Resident / patient identifier', type: 'text', required: true },
      { label: 'Known allergies', type: 'textarea', required: true },
      { label: 'Texture-modified diet requirement', type: 'text' },
      { label: 'Nutrition / hydration notes', type: 'textarea' },
      { label: 'Religious or cultural requirements', type: 'textarea' },
      { label: 'Care plan reference', type: 'text' },
      { label: 'Last reviewed date', type: 'date', required: true },
      { label: 'Reviewed by', type: 'signature', required: true },
    ],
  },
]

export function templateToCsv(template: ComplianceTemplate) {
  const headers = template.fields.map((field) => field.label)
  const escapedHeaders = headers.map((header) => `"${header.replace(/"/g, '""')}"`)
  return `${escapedHeaders.join(',')}\n`
}
