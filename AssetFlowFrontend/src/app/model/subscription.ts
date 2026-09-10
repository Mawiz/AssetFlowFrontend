export interface SubscriptionType {
  id: number;
  name: string;
  displayName: string;
  order: number;
  description: string;
  isActive: boolean;
}

export interface CreateSubscriptionType {
  name: string;
  displayName: string;
  order: number;
  description: string;
}

export interface UpdateSubscriptionType extends CreateSubscriptionType {
  id: number;
}
