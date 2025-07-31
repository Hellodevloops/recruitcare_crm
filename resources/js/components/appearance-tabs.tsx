import { Appearance, useAppearance } from '@/hooks/use-appearance';
import { cn } from '@/lib/utils';
import { LucideIcon, Monitor, Moon, Palette, Sun } from 'lucide-react';
import { HTMLAttributes, useState } from 'react';

// Add Theme type based on CSS themes from the file
type Theme = 'default' | 'blue' | 'green' | 'blue-green' | 'purple' | 'rose';

// Create a hook for theme similar to appearance
export function useTheme() {
    const [theme, setTheme] = useState<Theme>('default');

    const updateTheme = (newTheme: Theme) => {
        // Remove all theme classes first
        document.documentElement.classList.remove(
            'theme-blue',
            'theme-green',
            'theme-blue-green',
            'theme-purple',
            'theme-rose'
        );
        
        // Add the new theme class if not default
        if (newTheme !== 'default') {
            document.documentElement.classList.add(`theme-${newTheme}`);
        }
        
        setTheme(newTheme);
    };

    return { theme, updateTheme };
}

// Combined tabs component for both appearance and themes
export default function ThemeAppearanceTabs({ className = '', ...props }: HTMLAttributes<HTMLDivElement>) {
    const { appearance, updateAppearance } = useAppearance();
    const { theme, updateTheme } = useTheme();
    const [activeTab, setActiveTab] = useState<'appearance' | 'theme'>('appearance');

    // Appearance tabs configuration
    const appearanceTabs: { value: Appearance; icon: LucideIcon; label: string }[] = [
        { value: 'light', icon: Sun, label: 'Light' },
        { value: 'dark', icon: Moon, label: 'Dark' },
        { value: 'system', icon: Monitor, label: 'System' },
    ];

    // Theme tabs configuration
    const themeTabs: { value: Theme; label: string; color: string }[] = [
        { value: 'default', label: 'Neutral', color: 'bg-neutral-700 dark:bg-neutral-300' },
        { value: 'blue', label: 'Blue', color: 'bg-blue-600 dark:bg-blue-400' },
        { value: 'green', label: 'Green', color: 'bg-green-600 dark:bg-green-400' },
        { value: 'blue-green', label: 'Teal', color: 'bg-teal-600 dark:bg-teal-400' },
        { value: 'purple', label: 'Purple', color: 'bg-purple-600 dark:bg-purple-400' },
        { value: 'rose', label: 'Rose', color: 'bg-rose-600 dark:bg-rose-400' },
    ];

    return (
        <div className={cn('space-y-3', className)} {...props}>
            {/* Tab selectors */}
            <div className="flex gap-3 mb-2">
                <button
                    onClick={() => setActiveTab('appearance')}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                        activeTab === 'appearance'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                >
                    <Sun className="h-4 w-4" />
                    Appearance
                </button>
                <button
                    onClick={() => setActiveTab('theme')}
                    className={cn(
                        'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                        activeTab === 'theme'
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    )}
                >
                    <Palette className="h-4 w-4" />
                    Theme
                </button>
            </div>

            {/* Appearance content */}
            {activeTab === 'appearance' && (
                <div className="inline-flex gap-1 rounded-lg bg-neutral-100 p-1 dark:bg-neutral-800 w-full">
                    {appearanceTabs.map(({ value, icon: Icon, label }) => (
                        <button
                            key={value}
                            onClick={() => updateAppearance(value)}
                            className={cn(
                                'flex items-center justify-center rounded-md px-3.5 py-1.5 transition-colors flex-1',
                                appearance === value
                                    ? 'bg-white shadow-xs dark:bg-neutral-700 dark:text-neutral-100'
                                    : 'text-neutral-500 hover:bg-neutral-200/60 hover:text-black dark:text-neutral-400 dark:hover:bg-neutral-700/60',
                            )}
                        >
                            <Icon className="h-4 w-4" />
                            <span className="ml-1.5 text-sm">{label}</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Theme content */}
            {activeTab === 'theme' && (
                <div className="grid grid-cols-3 gap-2">
                    {themeTabs.map(({ value, label, color }) => (
                        <button
                            key={value}
                            onClick={() => updateTheme(value)}
                            className={cn(
                                'flex flex-col items-center justify-center rounded-md p-3 transition-colors gap-2',
                                theme === value
                                    ? 'ring-2 ring-primary bg-accent'
                                    : 'bg-card hover:bg-accent',
                            )}
                        >
                            <div className={cn('w-8 h-8 rounded-full', color)} />
                            <span className="text-sm font-medium">{label}</span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}