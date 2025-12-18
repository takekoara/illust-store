import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps, Product, Tag } from '@/types';
import { useCallback } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';

// Custom Hooks
import { useProductImages } from '@/hooks/useProductImages';
import { useProductTags } from '@/hooks/useProductTags';

// Shared Components
import { ProductFormFields, TagSelector } from './shared/index';

// Local Components
import { ImageUploader } from './Edit/index';

interface Props extends PageProps {
    product: Product;
    tags: Tag[];
}

interface FormData {
    title: string;
    description: string;
    price: string;
    images?: File[];
    image_order: number[];
    combined_order: Array<{ type: 'new' | 'existing'; index: number; id?: number }>;
    tags: number[];
    tag_names: string[];
    _method?: string;
}

export default function Edit({ product, tags, auth }: Props) {
    const initialImageOrder = product.images
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map(img => img.id);

    const initialCombinedOrder = product.images
        .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0))
        .map((img, index) => ({
            type: 'existing' as const,
            index,
            id: img.id,
        }));

    const { data, setData, post, processing, errors } = useForm<FormData>({
        title: product.title || '',
        description: product.description || '',
        price: product.price ? product.price.toString() : '',
        image_order: initialImageOrder,
        combined_order: initialCombinedOrder,
        tags: product.tags ? product.tags.map((tag) => tag.id) : [],
        tag_names: [],
    });

    // Image management hook
    const handleImagesUpdate = useCallback((imageData: {
        images?: File[];
        image_order: number[];
        combined_order: Array<{ type: 'new' | 'existing'; index: number; id?: number }>;
    }) => {
        setData((prev) => ({
            ...prev,
            images: imageData.images,
            image_order: imageData.image_order,
            combined_order: imageData.combined_order,
        }));
    }, [setData]);

    const { combinedImages, onDrop, removeImage, handleDragEnd } = useProductImages({
        initialImages: product.images,
        onUpdate: handleImagesUpdate,
    });

    // Tag management hook
    const handleTagsUpdate = useCallback((tagData: { tags: number[]; tag_names: string[] }) => {
        setData((prev) => ({
            ...prev,
            tags: tagData.tags,
            tag_names: tagData.tag_names,
        }));
    }, [setData]);

    const {
        selectedTags,
        tagNames,
        tagInput,
        setTagInput,
        toggleTag,
        addTagFromInput,
        removeTagName,
        handleTagInputKeyDown,
    } = useProductTags({
        initialTagIds: product.tags ? product.tags.map((tag) => tag.id) : [],
        onUpdate: handleTagsUpdate,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        // For multipart/form-data, PHP requires POST with _method=PATCH
        setData((prev) => ({ ...prev, _method: 'PATCH' }));

        setTimeout(() => {
            post(route('products.update', product.id), {
                preserveState: true,
                preserveScroll: true,
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
                            {/* Basic Fields */}
                            <ProductFormFields
                                title={data.title}
                                description={data.description}
                                price={data.price}
                                onTitleChange={(value) => setData('title', value)}
                                onDescriptionChange={(value) => setData('description', value)}
                                onPriceChange={(value) => setData('price', value)}
                                errors={{
                                    title: errors.title,
                                    description: errors.description,
                                    price: errors.price,
                                }}
                            />

                            {/* Image Upload */}
                            <ImageUploader
                                images={combinedImages}
                                onDrop={onDrop}
                                onRemove={removeImage}
                                onDragEnd={handleDragEnd}
                                error={errors.images}
                            />

                            {/* Tag Selection */}
                            <TagSelector
                                tags={tags}
                                selectedTags={selectedTags}
                                tagNames={tagNames}
                                tagInput={tagInput}
                                onTagInputChange={setTagInput}
                                onTagInputKeyDown={handleTagInputKeyDown}
                                onTagInputBlur={addTagFromInput}
                                onToggleTag={toggleTag}
                                onRemoveTagName={removeTagName}
                                error={errors.tags}
                                tagNamesError={errors.tag_names}
                            />

                            {/* Submit Button */}
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
