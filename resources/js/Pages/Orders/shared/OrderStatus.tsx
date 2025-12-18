const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
    pending: '支払い待ち',
    processing: '処理中',
    completed: '完了',
    cancelled: 'キャンセル',
};

interface OrderStatusBadgeProps {
    status: string;
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
    return (
        <span
            className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${
                STATUS_COLORS[status] || 'bg-gray-100 text-gray-800'
            }`}
        >
            {STATUS_LABELS[status] || status}
        </span>
    );
}

export function getStatusColor(status: string): string {
    return STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
}

export function getStatusLabel(status: string): string {
    return STATUS_LABELS[status] || status;
}

