import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import { BillingAddress } from '../shared/types';

interface BillingAddressFormProps {
    data: BillingAddress;
    onChange: (field: keyof BillingAddress, value: string) => void;
    errors: Record<string, string | undefined>;
}

export function BillingAddressForm({ data, onChange, errors }: BillingAddressFormProps) {
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">請求先情報</h3>

            <div>
                <InputLabel htmlFor="name" value="お名前" />
                <TextInput
                    id="name"
                    type="text"
                    value={data.name}
                    className="mt-1 block w-full"
                    onChange={(e) => onChange('name', e.target.value)}
                    required
                />
                <InputError message={errors['billing_address.name']} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="email" value="メールアドレス" />
                <TextInput
                    id="email"
                    type="email"
                    value={data.email}
                    className="mt-1 block w-full"
                    onChange={(e) => onChange('email', e.target.value)}
                    required
                />
                <InputError message={errors['billing_address.email']} className="mt-2" />
            </div>

            <div>
                <InputLabel htmlFor="address" value="住所" />
                <TextInput
                    id="address"
                    type="text"
                    value={data.address}
                    className="mt-1 block w-full"
                    onChange={(e) => onChange('address', e.target.value)}
                    required
                />
                <InputError message={errors['billing_address.address']} className="mt-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <InputLabel htmlFor="city" value="市区町村" />
                    <TextInput
                        id="city"
                        type="text"
                        value={data.city}
                        className="mt-1 block w-full"
                        onChange={(e) => onChange('city', e.target.value)}
                        required
                    />
                    <InputError message={errors['billing_address.city']} className="mt-2" />
                </div>

                <div>
                    <InputLabel htmlFor="postal_code" value="郵便番号" />
                    <TextInput
                        id="postal_code"
                        type="text"
                        value={data.postal_code}
                        className="mt-1 block w-full"
                        onChange={(e) => onChange('postal_code', e.target.value)}
                        required
                    />
                    <InputError message={errors['billing_address.postal_code']} className="mt-2" />
                </div>
            </div>
        </div>
    );
}

