import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { PageProps, Tag } from '@/types';
import { useCallback } from 'react';
import PrimaryButton from '@/Components/PrimaryButton';

// Custom Hooks
import { useCreateImages } from '@/hooks/useCreateImages';
import { useProductTags } from '@/hooks/useProductTags';

// Shared Components (from Edit)
import { ProductFormFields, TagSelector } from './Edit/index';

// Local Components
import { ImageUploader } from './Create/index';

interface Props extends PageProps {
    tags: Tag[];
}

export default function Create({ tags, auth }: Props) {
    const { data, setData, post, processing, errors, reset: resetForm } = useForm({
        title: '',
        description: '',
        price: '',
        images: [] as File[],
        tags: [] as number[],
        tag_names: [] as string[],
    });

    // Image management hook
    const handleImagesUpdate = useCallback((files: File[]) => {
        setData('images', files);
    }, [setData]);

    const { images, onDrop, removeImage, handleDragEnd, reset: resetImages } = useCreateImages({
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
        initialTagIds: [],
        onUpdate: handleTagsUpdate,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post(route('products.store'), {
            onSuccess: () => {
                resetForm();
                resetImages();
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    商品作成
                </h2>
            }
        >
            <Head title="商品作成" />

            <div className="py-12">
                <div className="mx-auto max-w-4xl sm:px-6 lg:px-8">
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <form onSubmit={submit} className="p-6">
                            {/* Basic Fields (reusing from Edit) */}
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
                                images={images}
                                onDrop={onDrop}
                                onRemove={removeImage}
                                onDragEnd={handleDragEnd}
                                error={errors.images}
                            />

                            {/* Tag Selection (reusing from Edit) */}
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
                                    {processing ? '作成中...' : '作成'}
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
