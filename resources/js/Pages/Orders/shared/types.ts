export interface OrderItem {
    id: number;
    price: number;
    product: {
        id: number;
        title: string;
        images: Array<{
            id: number;
            image_path: string;
            is_primary: boolean;
        }>;
    } | null;
}

export interface Order {
    id: number;
    order_number: string;
    total_amount: number;
    status: string;
    billing_address: BillingAddress | null;
    created_at: string;
    items: OrderItem[];
    metadata?: {
        email_sent?: boolean;
        email_sent_at?: string;
    };
}

export interface BillingAddress {
    name: string;
    email: string;
    address: string;
    city: string;
    postal_code: string;
    country: string;
}

export interface CartItem {
    id: number;
    product: {
        id: number;
        title: string;
        price: number;
        images: Array<{
            id: number;
            image_path: string;
            is_primary: boolean;
        }>;
    };
}

