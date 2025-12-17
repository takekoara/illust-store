export interface User {
    id: number;
    name: string;
    username?: string;
    email: string;
    email_verified_at?: string;
    avatar_type?: string | null;
    bio?: string | null;
    website?: string | null;
    location?: string | null;
    is_admin?: boolean;
}

export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>,
> = T & {
    auth: {
        user: User;
    };
};

// Product related types
export interface ProductImage {
    id: number;
    image_path: string;
    thumbnail_path?: string | null;
    is_primary: boolean;
    sort_order?: number;
}

export interface ProductTag {
    id: number;
    name: string;
    slug?: string;
}

export interface ProductUser {
    id: number;
    name: string;
    username: string;
    avatar?: string | null;
    avatar_type?: string | null;
}

export interface Product {
    id: number;
    title: string;
    description?: string;
    price: number;
    views?: number;
    sales_count?: number;
    is_active?: boolean;
    sort_order?: number;
    created_at?: string;
    user: ProductUser;
    images: ProductImage[];
    tags: ProductTag[];
}

// Simplified product for lists
export interface ProductListItem {
    id: number;
    title: string;
    price: number;
    views?: number;
    sales_count?: number;
    is_active?: boolean;
    created_at?: string;
    user?: ProductUser;
    images?: Array<{
        id: number;
        image_path: string;
        is_primary?: boolean;
    }>;
    tags?: Array<{
        id: number;
        name: string;
        slug?: string;
    }>;
}

// Related product (simplified)
export interface RelatedProduct {
    id: number;
    title: string;
    price: number;
    images: Array<{
        id: number;
        image_path: string;
        is_primary: boolean;
    }>;
}

// Tag type
export interface Tag {
    id: number;
    name: string;
    slug: string;
}

// Image file for uploads
export interface ImageFile {
    file: File;
    preview: string;
    id: string;
}

// Existing image (for edit forms)
export interface ExistingImage {
    id: number;
    image_path: string;
    is_primary: boolean;
    sort_order: number;
}

// Combined image (for edit forms with drag & drop)
export interface CombinedImage {
    id: string;
    type: 'existing' | 'new';
    existingId?: number;
    file?: File;
    preview: string;
}
