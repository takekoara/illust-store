import { ImageFile } from '@/types';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableImageItemProps {
    image: ImageFile;
    onRemove: () => void;
    isPrimary?: boolean;
}

export function SortableImageItem({ image, onRemove, isPrimary }: SortableImageItemProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: image.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative">
            <img
                src={image.preview}
                alt="Preview"
                className="h-32 w-32 rounded-lg object-cover cursor-move"
                {...attributes}
                {...listeners}
            />
            {isPrimary && (
                <span className="absolute top-2 left-2 rounded bg-indigo-600 px-2 py-1 text-xs text-white">
                    メイン
                </span>
            )}
            <button
                type="button"
                onClick={onRemove}
                className="absolute -right-2 -top-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
            >
                ×
            </button>
        </div>
    );
}

