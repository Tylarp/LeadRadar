export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  currencySymbol: string;
  mode: 'subscription' | 'payment';
  features: string[];
}

export const STRIPE_PRODUCTS: Record<string, StripeProduct> = {
  starter: {
    id: 'prod_V8jgJhLb11dAnr',
    priceId: 'price_1U8SCgBolnPPkM4DnIbt5mJG',
    name: 'Starter',
    description: 'Starter pack for LeadRadar',
    price: 10.00,
    currency: 'usd',
    currencySymbol: '$',
    mode: 'subscription',
    features: [
      '50 leads per month',
      'Basic lead scoring',
      'Email export',
      'Standard support',
    ],
  },
  pro: {
    id: 'prod_V8jgrTYPo6uRbc',
    priceId: 'price_1U8SDIBolnPPkM4DmywMyf9Y',
    name: 'Pro',
    description: 'Pro pack for LeadRadar',
    price: 20.00,
    currency: 'usd',
    currencySymbol: '$',
    mode: 'subscription',
    features: [
      '200 leads per month',
      'Advanced lead scoring',
      'Email & CSV export',
      'Priority support',
      'CRM integrations',
    ],
  },
  agency: {
    id: 'prod_V8jhp68aPWtdis',
    priceId: 'price_1U8SDkBolnPPkM4DydKXtu38',
    name: 'Agency',
    description: 'Agency pack for LeadRadar',
    price: 40.00,
    currency: 'usd',
    currencySymbol: '$',
    mode: 'subscription',
    features: [
      'Unlimited leads',
      'AI-powered scoring',
      'All export formats',
      'Dedicated support',
      'White-label reports',
      'Team collaboration',
    ],
  },
};

export const PRODUCTS_LIST = [
  STRIPE_PRODUCTS.starter,
  STRIPE_PRODUCTS.pro,
  STRIPE_PRODUCTS.agency,
];