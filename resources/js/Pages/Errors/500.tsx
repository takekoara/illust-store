import { PageProps } from '@/types';
import { ErrorPage } from './ErrorPage';

interface Props extends PageProps {
    message?: string;
}

export default function Error500({ auth, message }: Props) {
    return (
        <ErrorPage
            auth={auth}
            code={500}
            title="サーバーエラーが発生しました"
            defaultMessage="申し訳ございません。サーバーでエラーが発生しました。しばらくしてから再度お試しください。"
            message={message}
            color="red"
        />
    );
}
