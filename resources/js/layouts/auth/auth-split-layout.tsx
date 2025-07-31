import AppLogoIcon from '@/components/app-logo-icon';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';
import { BarChart3, Users, MessageSquare, LineChart, Shield, ArrowRight } from 'lucide-react';

interface AuthLayoutProps {
    title?: string;
    description?: string;
}

export default function AuthSplitLayout({ children, title, description }: PropsWithChildren<AuthLayoutProps>) {
    const { name, quote } = usePage<SharedData>().props;

    return (
        <div className="relative grid h-dvh flex-col items-center justify-center lg:max-w-none lg:grid-cols-2 lg:px-0">
            {/* Creative minimalist left panel */}
            <div className="relative hidden h-full flex-col overflow-hidden lg:flex">
                {/* Minimalist background */}
                <div className="absolute inset-0 bg-slate-900" />
                
                {/* Subtle grid pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImEiIHdpZHRoPSIxMCIgaGVpZ2h0PSIxMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZmlsbD0iI2ZmZiIgZD0iTTAgMGgxdjFIMHoiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IGZpbGw9InVybCgjYSkiIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9zdmc+')] opacity-50" />
                
                <div className="relative z-10 flex h-full flex-col p-12">
                    {/* Logo area */}
                    <div className="flex items-center space-x-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-white/10">
                            <AppLogoIcon className="size-6 fill-current text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-medium tracking-tight text-white">
                                Sales<span className="font-bold">Care</span>
                            </h2>
                            <p className="text-xs text-slate-400">Customer Success Platform</p>
                        </div>
                    </div>
                    
                    {/* Feature highlights with Lucide icons */}
                    <div className="mt-12">
                        <h3 className="mb-6 text-sm font-medium uppercase tracking-wider text-slate-400">All-in-one platform</h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="group flex flex-col gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 group-hover:bg-indigo-600/20">
                                    <BarChart3 className="size-5 text-indigo-400" />
                                </div>
                                <h4 className="text-sm font-medium text-white">Analytics</h4>
                                <p className="text-xs text-slate-400">Real-time customer insights</p>
                            </div>
                            
                            <div className="group flex flex-col gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 group-hover:bg-indigo-600/20">
                                    <Users className="size-5 text-indigo-400" />
                                </div>
                                <h4 className="text-sm font-medium text-white">CRM</h4>
                                <p className="text-xs text-slate-400">Complete customer records</p>
                            </div>
                            
                            <div className="group flex flex-col gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 group-hover:bg-indigo-600/20">
                                    <MessageSquare className="size-5 text-indigo-400" />
                                </div>
                                <h4 className="text-sm font-medium text-white">Support</h4>
                                <p className="text-xs text-slate-400">Ticketing and messaging</p>
                            </div>
                            
                            <div className="group flex flex-col gap-2">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 group-hover:bg-indigo-600/20">
                                    <LineChart className="size-5 text-indigo-400" />
                                </div>
                                <h4 className="text-sm font-medium text-white">Growth</h4>
                                <p className="text-xs text-slate-400">Track sales performance</p>
                            </div>
                        </div>
                    </div>
                    
                    {/* Minimalist quote */}
                    {quote && (
                        <div className="mt-auto border-t border-slate-800 pt-6">
                            <blockquote className="text-sm text-slate-300">
                                "{quote.message}"
                            </blockquote>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-slate-700" />
                                <p className="text-xs font-medium text-white">{quote.author}</p>
                            </div>
                        </div>
                    )}
                    
                    {/* Security note with icon */}
                    <div className="mt-8 flex items-center gap-2 text-xs text-slate-500">
                        <Shield className="size-3" />
                        <p>Enterprise-grade security and compliance</p>
                    </div>
                </div>
            </div>
            
            {/* Minimal right panel with form */}
            <div className="w-full bg-white px-6 dark:bg-slate-950 lg:px-12">
                <div className="mx-auto flex w-full max-w-sm flex-col justify-center py-12">
                    {/* Mobile logo */}
                    <div className="mb-10 flex flex-col items-center lg:hidden">
                        <div className="flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-900">
                                <AppLogoIcon className="size-5 fill-current text-white" />
                            </div>
                            <span className="text-lg font-medium text-slate-900 dark:text-white">
                                Sales<span className="font-bold">Care</span>
                            </span>
                        </div>
                    </div>
                    
                    {/* Form header */}
                    <div className="mb-8">
                        <h1 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h1>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
                    </div>
                    
                    {/* Form container */}
                    <div className="mb-6">
                        {children}
                    </div>
                    
                 
                    
                 
                </div>
            </div>
        </div>
    );
}