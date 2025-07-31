import React from 'react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

// Define breadcrumbs for navigation context (optional, depends on AppLayout)
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Unauthorized',
        href: null, // Current page, no link
    },
];

// Props type definition for reusability
interface UnauthorizedProps {
    message?: string; // Custom message prop, optional
    returnUrl?: string; // Optional URL for the "Go Back" button
}

export default function Unauthorized({
    message = 'You do not have permission to access this page. Please contact your administrator.',
    returnUrl = '/dashboard',
}: UnauthorizedProps) {
    return (
        <AppLayout>
            <Head title="Unauthorized Access" />
            <div className="relative min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-800 overflow-hidden">
                {/* Background Placeholder Pattern */}
                <div className="absolute inset-0 z-0 opacity-10">
                    <PlaceholderPattern />
                </div>

                {/* Main Content */}
                <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl px-6 py-12 text-center">
                    {/* Alert Icon */}
                    <div className="mb-6">
                        <ShieldAlert className="h-16 w-16 text-red-500 animate-pulse" />
                    </div>

                    {/* Heading */}
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Unauthorized Access
                    </h1>

                    {/* Message */}
                    <p className="text-lg md:text-xl text-gray-600 max-w-2xl mb-8 leading-relaxed">
                        {message}
                    </p>

                    {/* Action Button */}
                    <Button
                        variant="outline"
                        size="lg"
                        className="group flex items-center space-x-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                        onClick={() => window.location.href = returnUrl}
                    >
                        <ArrowLeft className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
                        <span>Return to Dashboard</span>
                    </Button>

                    {/* Support Link */}
                    <div className="mt-8 text-sm text-gray-500">
                        Need assistance?{' '}
                        <a
                            href="mailto:support@example.com"
                            className="text-blue-600 hover:underline"
                        >
                            Contact Support
                        </a>
                    </div>
                </div>

                {/* Optional Decorative Element */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-100 to-transparent pointer-events-none" />
            </div>
        </AppLayout>
    );
}