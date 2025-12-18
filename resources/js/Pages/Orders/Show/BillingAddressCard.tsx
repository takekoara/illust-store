import { BillingAddress } from '../shared/types';

interface BillingAddressCardProps {
    address: BillingAddress;
}

export function BillingAddressCard({ address }: BillingAddressCardProps) {
    return (
        <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
            <div className="p-6">
                <h3 className="mb-4 text-lg font-semibold">請求先</h3>
                <div className="space-y-2 text-sm">
                    <p>
                        <span className="font-semibold">お名前:</span> {address.name}
                    </p>
                    <p>
                        <span className="font-semibold">メール:</span> {address.email}
                    </p>
                    <p>
                        <span className="font-semibold">住所:</span> {address.address}
                    </p>
                    <p>
                        {address.city} {address.postal_code}
                    </p>
                    <p>
                        <span className="font-semibold">国:</span> {address.country}
                    </p>
                </div>
            </div>
        </div>
    );
}

