import { ReactNode } from 'react';

interface AboutSectionProps {
    title: string;
    children: ReactNode;
}

export function AboutSection({ title, children }: AboutSectionProps) {
    return (
        <section className="border-t border-gray-200 pt-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">{title}</h2>
            <div className="space-y-3 text-gray-700">{children}</div>
        </section>
    );
}

