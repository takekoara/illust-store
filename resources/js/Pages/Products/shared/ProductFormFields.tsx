import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';

interface ProductFormFieldsProps {
    title: string;
    description: string;
    price: string;
    onTitleChange: (value: string) => void;
    onDescriptionChange: (value: string) => void;
    onPriceChange: (value: string) => void;
    errors: {
        title?: string;
        description?: string;
        price?: string;
    };
}

export function ProductFormFields({
    title,
    description,
    price,
    onTitleChange,
    onDescriptionChange,
    onPriceChange,
    errors,
}: ProductFormFieldsProps) {
    return (
        <>
            {/* Title */}
            <div className="mb-4">
                <InputLabel htmlFor="title" value="タイトル" />
                <TextInput
                    id="title"
                    type="text"
                    value={title}
                    className="mt-1 block w-full"
                    onChange={(e) => onTitleChange(e.target.value)}
                    required
                />
                <InputError message={errors.title} className="mt-2" />
            </div>

            {/* Description */}
            <div className="mb-4">
                <InputLabel htmlFor="description" value="説明" />
                <textarea
                    id="description"
                    value={description}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                    onChange={(e) => onDescriptionChange(e.target.value)}
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
                    value={price}
                    className="mt-1 block w-full"
                    onChange={(e) => onPriceChange(e.target.value)}
                    min="0"
                    step="1"
                    required
                />
                <InputError message={errors.price} className="mt-2" />
            </div>
        </>
    );
}

