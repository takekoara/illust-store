import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import { PageProps, Product, Tag, CombinedImage } from '@/types';
import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
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
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Props extends PageProps {
    product: Product;
    tags: Tag[];
}

function SortableImageItem({ image, onRemove, isPrimary }: { image: CombinedImage; onRemove?: () => void; isPrimary: boolean }) {
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
                alt="Product"
                className="h-32 w-32 rounded-lg object-cover cursor-move"
                {...attributes}
                {...listeners}
            />
            {isPrimary && (
                <span className="absolute top-2 left-2 rounded bg-indigo-600 px-2 py-1 text-xs text-white">
                    メイン
                </span>
            )}
            {onRemove && (
                <button
                    type="button"
                    onClick={onRemove}
                    className="absolute top-1 right-1 rounded-full bg-red-500 p-1 text-white hover:bg-red-600 z-10 shadow-lg"
                    style={{ fontSize: '18px', lineHeight: '1', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                    ×
                </button>
            )}
        </div>
    );
}

export default function Edit({ product, tags, auth }: Props) {
    // 既存画像と新規画像を統合した配列
    const [combinedImages, setCombinedImages] = useState<CombinedImage[]>(() => {
        const existing = product.images
            .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
            .map((img) => ({
                id: `existing-${img.id}`,
                type: 'existing' as const,
                existingId: img.id,
                preview: `/storage/${img.image_path}`,
            }));
        return existing;
    });
    const [selectedTags, setSelectedTags] = useState<number[]>(
        product.tags ? product.tags.map((tag) => tag.id) : []
    );
    const [tagInput, setTagInput] = useState('');

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const { data, setData, patch, post, processing, errors } = useForm<{
        title: string;
        description: string;
        price: string;
        images?: File[];
        image_order: number[];
        combined_order: Array<{ type: 'new' | 'existing'; index: number; id?: number }>; // 新規画像と既存画像の混合順序
        tags: number[];
        tag_names: string[];
    }>({
        title: product.title || '',
        description: product.description || '',
        price: product.price ? product.price.toString() : '',
        image_order: product.images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map(img => img.id), // 既存画像のIDの順序
        combined_order: product.images.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map((img, index) => ({
            type: 'existing' as const,
            index: index,
            id: img.id,
        })), // 初期状態: 既存画像のみ
        tags: product.tags ? product.tags.map((tag) => tag.id) : [],
        tag_names: [] as string[], // 新規タグ名の配列
    });

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const newImageFiles: CombinedImage[] = acceptedFiles.map((file) => ({
            id: `new-${Math.random().toString(36).substr(2, 9)}`,
            type: 'new' as const,
            file,
            preview: URL.createObjectURL(file),
        }));
        // 新規画像を最後尾に追加
        setCombinedImages((prev) => {
            const newCombined = [...prev, ...newImageFiles];
            // combined_orderを更新
            const newOrder: Array<{ type: 'new' | 'existing'; index: number; id?: number }> = [];
            const newImageFilesArray: File[] = [];
            let newImageIndex = 0;
            
            newCombined.forEach((img, index) => {
                if (img.type === 'new' && img.file) {
                    newOrder.push({ type: 'new', index: newImageIndex });
                    newImageFilesArray.push(img.file);
                    newImageIndex++;
                } else if (img.type === 'existing' && img.existingId) {
                    newOrder.push({ type: 'existing', index: index, id: img.existingId });
                }
            });
            
            const existingIds = newCombined
                .filter((item) => item.type === 'existing' && item.existingId)
                .map((item) => item.existingId!);
            
            setData((prevData) => ({
                ...prevData,
                images: newImageFilesArray,
                image_order: existingIds,
                combined_order: newOrder,
            }));
            return newCombined;
        });
    }, [setData]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
        },
        maxSize: 10 * 1024 * 1024,
    });

    const removeImage = (id: string) => {
        setCombinedImages((prev) => {
            const image = prev.find((img) => img.id === id);
            if (image) {
                if (image.type === 'new' && image.file) {
                    // 新規画像の場合、ファイルを削除
                    URL.revokeObjectURL(image.preview);
                }
            }
            const newItems = prev.filter((img) => img.id !== id);
            
            // combined_orderを更新
            const newOrder: Array<{ type: 'new' | 'existing'; index: number; id?: number }> = [];
            const newImageFiles: File[] = [];
            let newImageIndex = 0;
            
            newItems.forEach((img, index) => {
                if (img.type === 'new' && img.file) {
                    newOrder.push({ type: 'new', index: newImageIndex });
                    newImageFiles.push(img.file);
                    newImageIndex++;
                } else if (img.type === 'existing' && img.existingId) {
                    newOrder.push({ type: 'existing', index: index, id: img.existingId });
                }
            });
            
            const existingIds = newItems
                .filter((item) => item.type === 'existing' && item.existingId)
                .map((item) => item.existingId!);
            
            setData((prevData) => ({
                ...prevData,
                images: newImageFiles,
                image_order: existingIds,
                combined_order: newOrder,
            }));
            
            return newItems;
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setCombinedImages((items) => {
                const oldIndex = items.findIndex((item) => item.id === active.id);
                const newIndex = items.findIndex((item) => item.id === over.id);
                const newItems = arrayMove(items, oldIndex, newIndex);
                
                // combined_orderを更新（新規画像と既存画像の混合順序を保持）
                const newOrder: Array<{ type: 'new' | 'existing'; index: number; id?: number }> = [];
                const newImageFiles: File[] = [];
                let newImageIndex = 0;
                
                newItems.forEach((img, index) => {
                    if (img.type === 'new' && img.file) {
                        newOrder.push({ type: 'new', index: newImageIndex });
                        newImageFiles.push(img.file);
                        newImageIndex++;
                    } else if (img.type === 'existing' && img.existingId) {
                        newOrder.push({ type: 'existing', index: index, id: img.existingId });
                    }
                });
                
                // 既存画像のIDのみをimage_orderに含める
                const existingIds = newItems
                    .filter((item) => item.type === 'existing' && item.existingId)
                    .map((item) => item.existingId!);
                
                setData((prevData) => ({
                    ...prevData,
                    image_order: existingIds,
                    images: newImageFiles,
                    combined_order: newOrder,
                }));
                
                return newItems;
            });
        }
    };

    const toggleTag = (tagId: number) => {
        setSelectedTags((prev) => {
            const newTags = prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId];
            setData((prevData) => ({
                ...prevData,
                tags: newTags,
            }));
            return newTags;
        });
    };

    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTagFromInput();
        }
    };

    const addTagFromInput = () => {
        const tagName = tagInput.trim();
        if (tagName) {
            setData((prevData) => {
                const currentTagNames = prevData.tag_names || [];
                if (!currentTagNames.includes(tagName)) {
                    return {
                        ...prevData,
                        tag_names: [...currentTagNames, tagName],
                    };
                }
                return prevData;
            });
            setTagInput('');
        }
    };

    const removeTagName = (tagName: string) => {
        setData((prevData) => ({
            ...prevData,
            tag_names: (prevData.tag_names || []).filter((name) => name !== tagName),
        }));
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Debug: Log form data before submission
        console.log('Submitting form data:', {
            title: data.title,
            description: data.description,
            price: data.price,
            images: data.images?.length || 0,
            image_order: data.image_order,
            tags: data.tags,
            tag_names: data.tag_names,
        });
        
        // PHPの仕様上、multipart/form-dataはPOSTメソッドでのみ自動的に解析される
        // PATCHメソッドでFormDataを送信する場合、POSTメソッドで_method=PATCHを追加する必要がある
        // setDataで_method=PATCHを追加してから、postメソッドを使用
        setData((prevData) => ({
            ...prevData,
            _method: 'PATCH',
        }));
        
        // Wait for setData to complete, then submit with POST method
        setTimeout(() => {
            post(route('products.update', product.id), {
                preserveState: true,
                preserveScroll: true,
                onError: (errors) => {
                    console.log('Form errors:', errors);
                    console.log('Form data after error:', data);
                },
            });
        }, 0);
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    商品編集
                </h2>
            }
        >
            <Head title="商品編集" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            {/* Title */}
                            <div className="mb-4">
                                <InputLabel htmlFor="title" value="タイトル" />
                                <TextInput
                                    id="title"
                                    type="text"
                                    value={data.title}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('title', e.target.value)}
                                    required
                                />
                                <InputError message={errors.title} className="mt-2" />
                            </div>

                            {/* Description */}
                            <div className="mb-4">
                                <InputLabel htmlFor="description" value="説明" />
                                <textarea
                                    id="description"
                                    value={data.description}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                    onChange={(e) => setData('description', e.target.value)}
                                    rows={5}
                                />
                                <InputError message={errors.description} className="mt-2" />
                            </div>

                            {/* Price */}
                            <div className="mb-4">
                                <InputLabel htmlFor="price" value="価格（円）" />
                                <TextInput
                                    id="price"
                                    type="number"
                                    value={data.price}
                                    className="mt-1 block w-full"
                                    onChange={(e) => setData('price', e.target.value)}
                                    min="0"
                                    step="1"
                                    required
                                />
                                <InputError message={errors.price} className="mt-2" />
                            </div>

                            {/* Images */}
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
                                        JPEG, PNG, GIF (最大50MB)
                                    </p>
                                </div>
                                <InputError message={errors.images} className="mt-2" />

                                {combinedImages.length > 0 && (
                                    <div className="mt-4">
                                        <p className="mb-2 text-sm text-gray-700">
                                            画像をドラッグして並べ替え（一番左上の画像がメイン画像になります）
                                        </p>
                                        <DndContext
                                            sensors={sensors}
                                            collisionDetection={closestCenter}
                                            onDragEnd={handleDragEnd}
                                        >
                                            <SortableContext
                                                items={combinedImages.map((img) => img.id)}
                                                strategy={rectSortingStrategy}
                                            >
                                                <div className="grid grid-cols-4 gap-4">
                                                    {combinedImages.map((image, index) => (
                                                        <SortableImageItem
                                                            key={image.id}
                                                            image={image}
                                                            onRemove={() => removeImage(image.id)}
                                                            isPrimary={index === 0}
                                                        />
                                                    ))}
                                                </div>
                                            </SortableContext>
                                        </DndContext>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="mb-4">
                                <InputLabel value="タグ" />
                                
                                {/* 新規タグ入力欄 */}
                                <div className="mt-2">
                                    <TextInput
                                        type="text"
                                        value={tagInput}
                                        className="block w-full"
                                        placeholder="タグを入力（Enterまたはカンマで追加）"
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagInputKeyDown}
                                        onBlur={addTagFromInput}
                                    />
                                    <p className="mt-1 text-xs text-gray-500">
                                        既存のタグから選択するか、新しいタグ名を入力してください
                                    </p>
                                </div>

                                {/* 入力された新規タグ */}
                                {data.tag_names.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {data.tag_names.map((tagName) => (
                                            <span
                                                key={tagName}
                                                className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                                            >
                                                #{tagName}
                                                <button
                                                    type="button"
                                                    onClick={() => removeTagName(tagName)}
                                                    className="text-green-600 hover:text-green-800"
                                                >
                                                    ×
                                                </button>
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* 既存のタグから選択 */}
                                {tags.length > 0 && (
                                    <div className="mt-3">
                                        <p className="mb-2 text-sm text-gray-700">既存のタグから選択:</p>
                                        <div className="flex flex-wrap gap-2">
                                            {tags.map((tag) => (
                                                <button
                                                    key={tag.id}
                                                    type="button"
                                                    onClick={() => toggleTag(tag.id)}
                                                    className={`rounded-full px-4 py-2 text-sm transition-colors ${
                                                        selectedTags.includes(tag.id)
                                                            ? 'bg-indigo-600 text-white'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                    }`}
                                                >
                                                    #{tag.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {tags.length === 0 && data.tag_names.length === 0 && (
                                    <p className="mt-2 text-sm text-gray-500">
                                        タグがまだありません。上記の入力欄から新しいタグを作成できます。
                                    </p>
                                )}

                                <InputError message={errors.tags} className="mt-2" />
                                <InputError message={errors.tag_names} className="mt-2" />
                            </div>

                            <div className="flex items-center justify-end gap-4">
                                <PrimaryButton type="submit" disabled={processing}>
                                    {processing ? '更新中...' : '更新'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

