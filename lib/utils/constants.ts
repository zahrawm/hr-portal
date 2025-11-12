import { ReactNode } from "react";

export interface FlashMessage {
  success: string | null;
  error: string | null;
  info: string | null;
  warning: string | null;
}

export type PageProps<T> = T & {
  flash: FlashMessage;
  auth: {
    user?: {
      name: string;
      first_name: string;
    };
  };
};

export type LayoutProps = {
  children: ReactNode;
};

export type Country = {
  name: string;
  flag: string;
  code: string;
  dialCode: string;
};

export type User = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  date_of_birth: string;
  mobile_network?: string;
  roles: Array<Role>;
  gender: string;
  status: string;
  created_at: string;
  last_login_at: string;
  warehouses?: Array<Warehouse>;
  assigned_countries: Array<string>;
};

export type Role = {
  id: string;
  name: string;
  display_name: string;
};

export type Permission = {
  id: string;
  name: string;
  display_name: string;
  module: string;
};

export type VerificationCode = {
  id: string;
  code: string;
  expires_at: string;
  created_at: string;
  user?: User;
};

export type Warehouse = {
  id: string;
  name: string;
  country: string;
  is_storehouse: boolean;
  location: string;
  created_at: string;
};

export type Client = {
  id: string;
  name: string;
  phone_number: string;
  email: string;
  currency: string;
  credit_limit: number;
  weekly_order: number;
  created_at: string;
};

export type Grain = {
  id: string;
  name: string;
};

export type SaleOrder = {
  id: string;
  quantity: number;
  price: number;
  delivery_start_date: string;
  delivery_end_date: string;
  client: {
    id: string;
    name: string;
  };
  grain: {
    id: string;
    name: string;
  };
};

export type PaginationLink = {
  url?: string;
  label: string;
  active: boolean;
};

export type PaginatedData<T> = {
  current_page: number;
  data: Array<T>;
  first_page_url: string;
  from: number;
  last_page: number;
  last_page_url: string;
  links: Array<PaginationLink>;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number;
  total: number;
};

export type Status =
  | "SUCCESSFUL"
  | "FAILED"
  | "PENDING"
  | "PROCESSING"
  | "REJECTED";

  // types.ts
export type Expense = {
  dateRecorded: string ;
  paymentMethod: string;
  businessLine: string;
  expenseCategory: string;
  productLine: string;
  amount: string;
  accountNumber: string | null;
  agentName: string;
  role: string;
  narration: string;
  weekOfTransaction: string;
  quantity: number;
  unitPrice: string;
};

export type ExpenseIndex = {
  id: string;
  reference: string;
  service: string;
  amount: number;
  status: Status;
  currency: string;
  created_at: string;
  created_by: string;
  service_provider: string;
};

export type PickupsIndex = {
  data: {
    id: string;
    grain: string;
    from: {
      source: string;
      id: string;
      name: string;
      phone_number: string;
      location: string;
    },
    to: {
      source: string;
      id: string;
      name: string;
      phone_number: string;
      location: string;
    },
    to_warehouse_id?: string;
    farmer_id?: string,
    aggregator_id?: string,
    payment_id?: string;
    quantity: number;
    received_quantity: number,
    created_at: string;
    updated_at: string;
    deleted_at: string;
  }

};

export type GrainPurchaseIndex = {
  id: string;
  reference: string;
  purchase_source: string;
  quantity: number;
  price: number;
  status: Status;
  currency: string;
  created_at: string;
  transaction_date: string;
  requested_by: string;
  reviewed_by: string;
  beneficiary: string;
  grain: string;
};

export type Entity = {
  id: string;
  name: string;
  gender?: string | null;
  date_of_birth?: string | null;
  phone_number?: string | null;
  mobile_network?: string | null;
  created_at: string;
};

export type PaymentDetail = {
  beneficiary: string;
  grain: string | null;
  service_provider: string | null;
  created_by: string;
  aggregator: string | null;
  created_at: string;
  transaction_date: string | null;
  status: Status;
  quantity: number;
  price: number;
  weight: number | null;
  currency: string;
  service_payment_reference: string | null;
  reference: string | null;
  type: "GRAIN_PURCHASE" | "SERVICE_PAYMENT";
  service: string | null;
  is_cash_payment: boolean;
  coordinates: string | null;
  requested_by: string | null;
  reviewed_by: string | null;
  fee: number;
  purchase_source: string | null;
  payment_provider: string;
  failure_reason: string | null;
  id: string;
  amount: string;
};

export interface ModalPageProps<T> {
  component: string;
  baseURL: string;
  redirectURL: string;
  props: T;
}

export type Dispatch = {
  id: string;
  grain: string;
  warehouse: string;
  quantity: number;
  received_quantity: number;
  created_at: string;
  sale_order_id: string | null;
  client: string | null;
  invoice: string | null;
};

export type Config = {
  id: string;
  key: string;
  display_name: string;
  value: string;
};

export enum AuthStep {
  Credentials = "CREDENTIALS",
  OTPVerification = "OTP_VERIFICATION",
}

export type AuthProps = {
  step: AuthStep;
  phone_number: string;
};

export type Report = {
  id: string;
  country: string;
  date: string;
  data: {
    sales: {
      total_profit: string;
      total_gross_profit: string;
      total_quantity_sold: number;
      average_profit_per_kg: string;
      average_selling_price_per_kg: string;
    };
    payments: {
      total_auxiliary_cost: string;
      total_spent_on_stock: string;
      average_cost_per_kg_of_stock: string;
      average_auxiliary_cost_per_kg: string;
      total_auxiliary_cost_to_deliver: string;
    };
    inventory: {
      inventory_left: number;
      total_quantity_sold: number;
      total_quantity_bought: number;
      inventory_brought_over: number;
    };
  };
  created_at: string;
  updated_at: string;
};

export type PaymentReport = {
  title: string;
  data: Array<{
    date: string;
    data: {
      total_auxiliary_cost: number;
      total_spent_on_stock: number;
      average_cost_per_kg_of_stock: number;
      average_auxiliary_cost_per_kg: number;
      total_auxiliary_cost_to_deliver: number;
    };
  }>;
};

export type InventoryReport = {
  title: string;
  data: Array<{
    date: string;
    data: {
      inventory_left: number;
      total_quantity_sold: number;
      total_quantity_bought: number;
      inventory_brought_over: number;
    };
  }>;
};

// export type SalesReport = {
//   title: string;
//   data: Array<{
//     date: string;
//     data: {
//       total_auxiliary_cost: number;
//       total_spent_on_stock: number;
//       average_cost_per_kg_of_stock: number;
//       average_auxiliary_cost_per_kg: number;
//       total_auxiliary_cost_to_deliver: number;
//     };
//   }>;
// };
export type SalesReport = {
  title: string;
  data: Array<{
    date: string;
    data: {
      total_profit: number;
      total_gross_profit: number;
      total_quantity_sold: number;
      average_profit_per_kg: number;
      average_selling_price_per_kg: number;
    };
  }>;
};

export interface ReportT<T> {
  title: string;
  data: Array<T>;
}
