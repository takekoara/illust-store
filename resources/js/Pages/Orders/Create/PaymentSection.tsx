import { PaymentElement } from '@stripe/react-stripe-js';
import { TestCardInfo } from './TestCardInfo';

interface PaymentSectionProps {
    clientSecret: string;
}

export function PaymentSection({ clientSecret }: PaymentSectionProps) {
    if (!clientSecret) return null;

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">支払い情報</h3>
            <TestCardInfo />
            <div className="rounded-lg border p-4">
                <PaymentElement />
            </div>
        </div>
    );
}

