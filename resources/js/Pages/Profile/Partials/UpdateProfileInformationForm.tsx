import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

export default function UpdateProfileInformation({
    mustVerifyEmail,
    status,
    className = '',
}: {
    mustVerifyEmail: boolean;
    status?: string;
    className?: string;
}) {
    const user = usePage().props.auth.user;

    const { data, setData, patch, errors, processing, recentlySuccessful } =
        useForm({
            name: user.name,
            username: user.username || '',
            email: user.email,
            bio: user.bio || '',
            avatar_type: user.avatar_type || '',
            website: user.website || '',
            location: user.location || '',
        });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('profile.update'));
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    プロフィール情報
                </h2>

                <p className="mt-1 text-sm text-gray-600">
                    アカウントのプロフィール情報とメールアドレスを更新できます。
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="name" value="名前" />

                    <TextInput
                        id="name"
                        className="mt-1 block w-full"
                        value={data.name}
                        onChange={(e) => setData('name', e.target.value)}
                        required
                        isFocused
                        autoComplete="name"
                    />

                    <InputError className="mt-2" message={errors.name} />
                </div>

                <div>
                    <InputLabel htmlFor="username" value="ユーザー名" />

                    <TextInput
                        id="username"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.username}
                        onChange={(e) => setData('username', e.target.value)}
                        autoComplete="username"
                    />

                    <InputError className="mt-2" message={errors.username} />
                </div>

                <div>
                    <InputLabel htmlFor="email" value="メールアドレス" />

                    <TextInput
                        id="email"
                        type="email"
                        className="mt-1 block w-full"
                        value={data.email}
                        onChange={(e) => setData('email', e.target.value)}
                        required
                        autoComplete="email"
                    />

                    <InputError className="mt-2" message={errors.email} />
                </div>

                <div>
                    <InputLabel htmlFor="bio" value="自己紹介" />

                    <textarea
                        id="bio"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={data.bio}
                        onChange={(e) => setData('bio', e.target.value)}
                        rows={4}
                    />

                    <InputError className="mt-2" message={errors.bio} />
                </div>

                <div>
                    <InputLabel value="アバター" />
                    <div className="mt-2 flex gap-4">
                        {['avatar1', 'avatar2', 'avatar3'].map((avatarType) => (
                            <button
                                key={avatarType}
                                type="button"
                                onClick={() => setData('avatar_type', avatarType)}
                                className={`relative h-20 w-20 rounded-full border-4 transition-all ${
                                    data.avatar_type === avatarType
                                        ? 'border-indigo-600 ring-2 ring-indigo-600'
                                        : 'border-gray-300 hover:border-gray-400'
                                }`}
                            >
                                <img
                                    src={`/images/avatars/${avatarType}.png`}
                                    alt={avatarType}
                                    className="h-full w-full rounded-full object-cover"
                                    onError={(e) => {
                                        // 画像がまだない場合はプレースホルダーを表示
                                        (e.target as HTMLImageElement).src = '/default-avatar.png';
                                    }}
                                />
                                {data.avatar_type === avatarType && (
                                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-indigo-600 bg-opacity-20">
                                        <span className="text-2xl text-indigo-600">✓</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                    <InputError className="mt-2" message={errors.avatar_type} />
                </div>

                <div>
                    <InputLabel htmlFor="website" value="ウェブサイト" />

                    <TextInput
                        id="website"
                        type="url"
                        className="mt-1 block w-full"
                        value={data.website}
                        onChange={(e) => setData('website', e.target.value)}
                        placeholder="https://example.com"
                    />

                    <InputError className="mt-2" message={errors.website} />
                </div>

                <div>
                    <InputLabel htmlFor="location" value="場所" />

                    <TextInput
                        id="location"
                        type="text"
                        className="mt-1 block w-full"
                        value={data.location}
                        onChange={(e) => setData('location', e.target.value)}
                        placeholder="東京, 日本"
                    />

                    <InputError className="mt-2" message={errors.location} />
                </div>

                {mustVerifyEmail && user.email_verified_at === null && (
                    <div>
                        <p className="mt-2 text-sm text-gray-800">
                            メールアドレスが未確認です。
                            <Link
                                href={route('verification.send')}
                                method="post"
                                as="button"
                                className="rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            >
                                こちらをクリックして確認メールを再送信してください。
                            </Link>
                        </p>

                        {status === 'verification-link-sent' && (
                            <div className="mt-2 text-sm font-medium text-green-600">
                                新しい確認リンクがメールアドレスに送信されました。
                            </div>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        {processing ? '保存中...' : '保存'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">
                            保存しました。
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
