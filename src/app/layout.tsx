import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'My Google AI Studio App',
    description: 'A Next.js Photo Album Application',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
