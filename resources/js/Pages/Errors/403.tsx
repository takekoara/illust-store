import { PageProps } from '@/types';
import { ErrorPage } from './ErrorPage';

interface Props extends PageProps {
    message?: string;
}

export default function Error403({ auth, message }: Props) {
    return (
        <ErrorPage
            auth={auth}
            code={403}
            title="アクセス権限がありません"
            defaultMessage="このページにアクセスする権限がありません。"
            message={message}
        />
    );
}
