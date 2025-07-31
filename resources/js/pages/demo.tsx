// External Libraries
import { useState, useEffect } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import Cal, { getCalApi } from "@calcom/embed-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

// Icons
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Target, 
  Clock,
  Calendar,
  AlertCircle 
} from 'lucide-react';

// UI Components
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Local Imports
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';

// Breadcrumb Configuration
const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
];

export default function SalesDashboard() {
    const { auth } = usePage<SharedData>().props;
    const calcomUrl = auth.user.calcom_url;
    
    useEffect(() => {
        if (calcomUrl) {
            (async function () {
                const cal = await getCalApi({"namespace":"30min"});
                cal("ui", {"hideEventTypeDetails":false,"layout":"month_view"});
            })();
        }
    }, [calcomUrl]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {calcomUrl ? (
                    <Cal 
                        namespace="30min"
                        calLink={calcomUrl}
                        style={{width:"100%", height:"100%", overflow:"scroll"}}
                        config={{"layout":"month_view"}}
                    />
                ) : (
                    <Card>
                        <CardContent className="pt-6">
                            <Alert variant="warning" className="mb-4">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Cal.com Integration Not Configured</AlertTitle>
                                <AlertDescription>
                                    Please configure your Cal.com URL in your profile settings to enable calendar booking functionality.
                                </AlertDescription>
                            </Alert>
                            
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <Calendar className="mb-4 h-16 w-16 text-muted-foreground" />
                                <h3 className="mb-2 text-xl font-semibold">Calendar Integration Missing</h3>
                                <p className="mb-6 text-muted-foreground">
                                    Your calendar integration requires a Cal.com URL to be configured.
                                </p>
                                <Button asChild>
                                    <Link href="/settings/profile">
                                        Configure in Profile Settings
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}