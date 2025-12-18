import { Tag } from '@/types';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import TextInput from '@/Components/TextInput';

interface TagSelectorProps {
    tags: Tag[];
    selectedTags: number[];
    tagNames: string[];
    tagInput: string;
    onTagInputChange: (value: string) => void;
    onTagInputKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onTagInputBlur: () => void;
    onToggleTag: (tagId: number) => void;
    onRemoveTagName: (tagName: string) => void;
    error?: string;
    tagNamesError?: string;
}

export function TagSelector({
    tags,
    selectedTags,
    tagNames,
    tagInput,
    onTagInputChange,
    onTagInputKeyDown,
    onTagInputBlur,
    onToggleTag,
    onRemoveTagName,
    error,
    tagNamesError,
}: TagSelectorProps) {
    return (
        <div className="mb-4">
            <InputLabel value="タグ" />

            {/* New tag input */}
            <div className="mt-2">
                <TextInput
                    type="text"
                    value={tagInput}
                    className="block w-full"
                    placeholder="タグを入力（Enterまたはカンマで追加）"
                    onChange={(e) => onTagInputChange(e.target.value)}
                    onKeyDown={onTagInputKeyDown}
                    onBlur={onTagInputBlur}
                />
                <p className="mt-1 text-xs text-gray-500">
                    既存のタグから選択するか、新しいタグ名を入力してください
                </p>
            </div>

            {/* Entered new tags */}
            {tagNames.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                    {tagNames.map((tagName) => (
                        <span
                            key={tagName}
                            className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800"
                        >
                            #{tagName}
                            <button
                                type="button"
                                onClick={() => onRemoveTagName(tagName)}
                                className="text-green-600 hover:text-green-800"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Existing tags selection */}
            {tags.length > 0 && (
                <div className="mt-3">
                    <p className="mb-2 text-sm text-gray-700">既存のタグから選択:</p>
                    <div className="flex flex-wrap gap-2">
                        {tags.map((tag) => (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => onToggleTag(tag.id)}
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

            {tags.length === 0 && tagNames.length === 0 && (
                <p className="mt-2 text-sm text-gray-500">
                    タグがまだありません。上記の入力欄から新しいタグを作成できます。
                </p>
            )}

            <InputError message={error} className="mt-2" />
            <InputError message={tagNamesError} className="mt-2" />
        </div>
    );
}

