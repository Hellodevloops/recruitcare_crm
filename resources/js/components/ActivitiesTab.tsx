import React from 'react';
import { useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Activity {
    id: number;
    title: string;
    description: string;
    due_date: string;
    status: string;
}

interface ActivitiesTabProps {
    activities: Activity[];
    candidateId: number;
}

export default function ActivitiesTab({ activities, candidateId }: ActivitiesTabProps) {
    const { data, setData, post, delete: destroy } = useForm({
        title: '',
        description: '',
        due_date: '',
        candidate_id: candidateId,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('candidates.activities.store'));
    };

    return (
        <div className="space-y-4 p-4">
            <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                    placeholder="Activity Title"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                />
                <Button type="submit">Add Activity</Button>
            </form>
            <div className="space-y-2">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex justify-between items-center p-2 border rounded">
                        <span>{activity.title}</span>
                        <Button variant="destructive" size="sm" onClick={() => destroy(route('candidates.activities.destroy', activity.id))}>
                            Delete
                        </Button>
                    </div>
                ))}
            </div>
        </div>
    );
}