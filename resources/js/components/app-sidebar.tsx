import React from 'react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { 
    LayoutGrid, 
    Users, 
    CalendarDays,
    ClipboardList, 
    DollarSign, 
    Settings,
    BarChart2,
    UserCog,
    ReceiptText ,
    Briefcase,
    MessageSquare,
    UserCircle,
    IdCard,
    Target,
    BookOpen,
    HelpCircle,
    CalendarClock  ,
    Shield,          // For Roles & Permissions
    UserPlus         // For Users Management
} from 'lucide-react';
import AppLogo from './app-logo';

// Main navigation items with permission keys matching Spatie
const allNavItems: NavItem[] = [
    {
        title: 'Candidates',
        href: '/candidates',
        icon: Users,
    },
    {
        title: 'HR',
        href: '/hr',
        icon: UserCircle,
    },
    {
        title: 'Brands',
        href: '/brands',
        icon: BookOpen,
    },
    {
        title: 'Positions',
        href: '/positions',
        icon: Briefcase,
    },
    {
        title: 'Board',
        href: '/deals',
        icon: Target,
    },
    {
        title: 'Interview Book',
        href: '/demo',
        icon: Briefcase,
    },
    {
        title: 'Calendar',
        href: '/calendar',
        icon: CalendarDays,
    },
    {
        title: 'Follow Ups',
        href: '/followups',
        icon: CalendarClock,
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: BarChart2,
    },
    {
        title: 'Pipelines',
        href: '/pipelines',
        icon: UserCog,
    },
    {
        title: 'Quotation',
        href: '/quotations',
        icon: ReceiptText,
    },
    {
        title: 'Invoice',
        href: '/invoices',
        icon: IdCard,
    },
    {
        title: 'Users Management',
        href: '/users',
        icon: UserPlus,
    },
    {
        title: 'Roles & Permissions',
        href: '/roles-permissions',
        icon: Shield,
    },
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
    },
];

// Footer navigation items (no permissions needed)
const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    // Access shared Inertia props
    const { props } = usePage();

    // Filter navigation items based on permissions (if you want to add back permissions, add them to NavItem type and here)
    const mainNavItems = allNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset" className="bg-gray-50">
            <SidebarHeader className="border-b border-gray-200">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="py-4">
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="border-t border-gray-200 p-4">
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}