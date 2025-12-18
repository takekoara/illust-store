import { PageProps } from '@/types';
import { ErrorPage } from './ErrorPage';

interface Props extends PageProps {
    message?: string;
}

export default function Error404({ auth, message }: Props) {
    return (
        <ErrorPage
            auth={auth}
            code={404}
            title="ページが見つかりません"
            defaultMessage="お探しのページは存在しないか、移動または削除された可能性があります。"
            message={message}
        />
    );
}
