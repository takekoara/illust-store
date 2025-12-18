import { useState, useCallback } from 'react';

interface UseProductTagsProps {
    initialTagIds: number[];
    initialTagNames?: string[];
    onUpdate: (data: { tags: number[]; tag_names: string[] }) => void;
}

export function useProductTags({ initialTagIds, initialTagNames = [], onUpdate }: UseProductTagsProps) {
    const [selectedTags, setSelectedTags] = useState<number[]>(initialTagIds);
    const [tagNames, setTagNames] = useState<string[]>(initialTagNames);
    const [tagInput, setTagInput] = useState('');

    const toggleTag = useCallback((tagId: number) => {
        setSelectedTags((prev) => {
            const newTags = prev.includes(tagId)
                ? prev.filter((id) => id !== tagId)
                : [...prev, tagId];
            onUpdate({ tags: newTags, tag_names: tagNames });
            return newTags;
        });
    }, [tagNames, onUpdate]);

    const addTagFromInput = useCallback(() => {
        const tagName = tagInput.trim();
        if (tagName && !tagNames.includes(tagName)) {
            const newTagNames = [...tagNames, tagName];
            setTagNames(newTagNames);
            onUpdate({ tags: selectedTags, tag_names: newTagNames });
            setTagInput('');
        } else {
            setTagInput('');
        }
    }, [tagInput, tagNames, selectedTags, onUpdate]);

    const removeTagName = useCallback((tagName: string) => {
        const newTagNames = tagNames.filter((name) => name !== tagName);
        setTagNames(newTagNames);
        onUpdate({ tags: selectedTags, tag_names: newTagNames });
    }, [tagNames, selectedTags, onUpdate]);

    const handleTagInputKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            addTagFromInput();
        }
    }, [addTagFromInput]);

    return {
        selectedTags,
        tagNames,
        tagInput,
        setTagInput,
        toggleTag,
        addTagFromInput,
        removeTagName,
        handleTagInputKeyDown,
    };
}

