export function getNotificationIcon(type: string): string {
    switch (type) {
        case 'like':
            return '❤️';
        case 'bookmark':
            return '🔖';
        case 'follow':
            return '👤';
        case 'message':
            return '💬';
        default:
            return '🔔';
    }
}

export function getNotificationColor(type: string): string {
    switch (type) {
        case 'like':
            return 'bg-red-50 border-red-200';
        case 'bookmark':
            return 'bg-blue-50 border-blue-200';
        case 'follow':
            return 'bg-green-50 border-green-200';
        case 'message':
            return 'bg-purple-50 border-purple-200';
        default:
            return 'bg-gray-50 border-gray-200';
    }
}

