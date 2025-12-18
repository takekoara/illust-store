interface MarkAllReadButtonProps {
    onClick: () => void;
    disabled: boolean;
}

export function MarkAllReadButton({ onClick, disabled }: MarkAllReadButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
            すべて既読にする
        </button>
    );
}

