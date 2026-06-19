export interface PaymentItem {
  monture_id: number | string
  quantity: number
}

export interface PaymentInitiatePayload {
  phone_number: string
  items: PaymentItem[]
}

export interface PaymentResponse {
  status: 'success' | 'error'
  message: string
  order_reference?: string
  campay_reference?: string
}

export interface StatusResponse {
  payment_status: 'pending' | 'success' | 'failed'
  order_status: 'pending' | 'paid' | 'failed'
}