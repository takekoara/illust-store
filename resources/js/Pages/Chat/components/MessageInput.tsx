import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';

interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    processing: boolean;
}

export function MessageInput({ value, onChange, onSubmit, processing }: MessageInputProps) {
    return (
        <div className="flex-shrink-0 border-t bg-white p-4">
            <form onSubmit={onSubmit} className="mx-auto flex max-w-4xl gap-2">
                <TextInput
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="メッセージを入力..."
                    className="flex-1"
                    required
                />
                <PrimaryButton type="submit" disabled={processing}>
                    送信
                </PrimaryButton>
            </form>
        </div>
    );
}

