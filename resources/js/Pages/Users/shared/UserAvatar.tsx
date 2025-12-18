interface UserAvatarProps {
    avatarType: string | null | undefined;
    name: string;
    size?: 'sm' | 'md' | 'lg';
    className?: string;
}

const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-24 w-24 border-4 border-white shadow-lg',
};

export function UserAvatar({ avatarType, name, size = 'md', className = '' }: UserAvatarProps) {
    const src = avatarType
        ? `/images/avatars/${avatarType}.png`
        : '/images/avatars/default-avatar.png';

    return (
        <img
            src={src}
            alt={name}
            className={`rounded-full ${sizeClasses[size]} ${className}`}
            onError={(e) => {
                (e.target as HTMLImageElement).src = '/images/avatars/default-avatar.png';
            }}
        />
    );
}

