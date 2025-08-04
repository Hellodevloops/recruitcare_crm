import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect } from 'react';

import DeleteUser from '@/components/delete-user';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
    calcom_url: string;
    default_pipeline_id: string;
}

interface Pipeline {
    id: number;
    name: string;
}

interface Props {
    mustVerifyEmail: boolean;
    status?: string;
    pipelines: Pipeline[];
}

export default function Profile({ mustVerifyEmail, status, pipelines }: Props) {
    const { auth } = usePage<SharedData>().props;
    
    // For debugging - remove in production
    useEffect(() => {
        console.log('Auth user data:', auth.user);
    }, [auth.user]);
    // remove in production

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<ProfileForm>({
        name: auth.user.name,
        email: auth.user.email,
        calcom_url: auth.user.calcom_url || '', // Ensure empty string if null/undefined
        default_pipeline_id: auth.user.default_pipeline_id?.toString() || 'none',
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        // Convert 'none' back to empty string for the backend
        const formData = {
            ...data,
            default_pipeline_id: data.default_pipeline_id === 'none' ? '' : data.default_pipeline_id
        };

        patch(route('profile.update'), {
            data: formData,
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Profile information" description="Update your profile information" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>

                            <Input
                                id="name"
                                className="mt-1 block w-full"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                autoComplete="name"
                                placeholder="Full name"
                            />

                            <InputError className="mt-2" message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">Email address</Label>

                            <Input
                                id="email"
                                type="email"
                                className="mt-1 block w-full"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                autoComplete="username"
                                placeholder="Email address"
                            />

                            <InputError className="mt-2" message={errors.email} />
                        </div>
                        
                        <div className="grid gap-2">
                            <Label htmlFor="calcom_url">Cal.com ID (optional)</Label>

                            <Input
                                id="calcom_url"
                                type="text"
                                className="mt-1 block w-full"
                                value={data.calcom_url}
                                onChange={(e) => setData('calcom_url', e.target.value)}
                                placeholder="example-live-xyz123/30min"
                            />
                            <p className="text-xs text-muted-foreground">Example format: boondock-live-y1hibx/30min</p>

                            <InputError className="mt-2" message={errors.calcom_url} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="default_pipeline_id">Default Pipeline (optional)</Label>

                            <Select
                                value={data.default_pipeline_id}
                                onValueChange={(value) => setData('default_pipeline_id', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a default pipeline" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No default pipeline</SelectItem>
                                    {pipelines.map((pipeline) => (
                                        <SelectItem key={pipeline.id} value={pipeline.id.toString()}>
                                            {pipeline.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <InputError className="mt-2" message={errors.default_pipeline_id} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                <DeleteUser />
            </SettingsLayout>
        </AppLayout>
    );
}