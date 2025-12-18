import { ImageFile } from '@/types';
import { useDropzone, FileRejection } from 'react-dropzone';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableImageItem } from './SortableImageItem';

interface ImageUploaderProps {
    images: ImageFile[];
    onDrop: (files: File[]) => void;
    onRemove: (id: string) => void;
    onDragEnd: (event: DragEndEvent) => void;
    error?: string;
}

export function ImageUploader({ images, onDrop, onRemove, onDragEnd, error }: ImageUploaderProps) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDropRejected = (fileRejections: FileRejection[]) => {
        fileRejections.forEach(({ file, errors }) => {
            errors.forEach((err) => {
                if (err.code === 'file-too-large') {
                    alert(`${file.name} は大きすぎます。50MB以下のファイルを選択してください。`);
                } else if (err.code === 'file-invalid-type') {
                    alert(`${file.name} は無効なファイル形式です。`);
                }
            });
        });
    };

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        onDropRejected: handleDropRejected,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
        },
        maxSize: 50 * 1024 * 1024, // 50MB per file
    });

    return (
        <div className="mb-4">
            <InputLabel value="画像" />
            <div
                {...getRootProps()}
                className={`mt-1 cursor-pointer rounded-lg border-2 border-dashed p-6 text-center ${
                    isDragActive
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-300'
                }`}
            >
                <input {...getInputProps()} />
                <p className="text-gray-600">
                    {isDragActive
                        ? 'ここに画像をドロップ'
                        : '画像をドラッグ&ドロップ、またはクリックして選択'}
                </p>
                <p className="mt-2 text-sm text-gray-500">
                    JPEG, PNG, GIF (最大10MB)
                </p>
            </div>
            <InputError message={error} className="mt-2" />

            {images.length > 0 && (
                <div className="mt-4">
                    <p className="mb-2 text-sm text-gray-700">
                        画像をドラッグして並べ替え（最初の画像がメイン画像になります）
                    </p>
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={onDragEnd}
                    >
                        <SortableContext
                            items={images.map((img) => img.id)}
                            strategy={rectSortingStrategy}
                        >
                            <div className="grid grid-cols-4 gap-4">
                                {images.map((image, index) => (
                                    <SortableImageItem
                                        key={image.id}
                                        image={image}
                                        onRemove={() => onRemove(image.id)}
                                        isPrimary={index === 0}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                </div>
            )}
        </div>
    );
}

