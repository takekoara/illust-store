import { Transition } from '@headlessui/react';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';

export default function FlashMessage() {
    const { flash } = usePage().props as any;
    const [show, setShow] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [type, setType] = useState<'success' | 'error' | 'warning' | 'info'>('success');

    useEffect(() => {
        if (flash?.success) {
            setMessage(flash.success);
            setType('success');
            setShow(true);
            setTimeout(() => setShow(false), 5000);
        } else if (flash?.error) {
            setMessage(flash.error);
            setType('error');
            setShow(true);
            // エラーメッセージは長めに表示
            setTimeout(() => setShow(false), 7000);
        } else if (flash?.warning) {
            setMessage(flash.warning);
            setType('warning');
            setShow(true);
            setTimeout(() => setShow(false), 5000);
        } else if (flash?.info) {
            setMessage(flash.info);
            setType('info');
            setShow(true);
            setTimeout(() => setShow(false), 5000);
        }
    }, [flash]);

    if (!message) return null;

    return (
        <Transition
            show={show}
            enter="transition ease-out duration-300"
            enterFrom="opacity-0 translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 translate-y-1"
        >
            <div className="fixed top-4 right-4 z-50 max-w-md">
                <div
                    className={`rounded-lg px-6 py-4 shadow-lg ${
                        type === 'success'
                            ? 'bg-green-500 text-white'
                            : type === 'error'
                            ? 'bg-red-500 text-white'
                            : type === 'warning'
                            ? 'bg-yellow-500 text-white'
                            : 'bg-blue-500 text-white'
                    }`}
                >
                    <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0 mt-0.5">
                            {type === 'success' ? '✓' : type === 'error' ? '✕' : type === 'warning' ? '⚠' : 'ℹ'}
                        </span>
                        <p className="font-medium flex-1 break-words">{message}</p>
                        <button
                            onClick={() => setShow(false)}
                            className="ml-2 text-white hover:text-gray-200 flex-shrink-0"
                            aria-label="閉じる"
                        >
                            ×
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    );
}

