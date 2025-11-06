import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Plus } from 'lucide-react';

interface Story {
    id: string;
    username: string;
    avatar?: string;
    hasNew: boolean;
}

interface StoriesBarProps {
    stories?: Story[];
}

export default function StoriesBar({ stories = [] }: StoriesBarProps) {
    const defaultStories: Story[] = [
        { id: '1', username: 'Tu historia', avatar: '', hasNew: false },
        { id: '2', username: 'usuario1', avatar: '', hasNew: true },
        { id: '3', username: 'usuario2', avatar: '', hasNew: true },
        { id: '4', username: 'usuario3', avatar: '', hasNew: false },
        { id: '5', username: 'usuario4', avatar: '', hasNew: true },
        { id: '6', username: 'usuario5', avatar: '', hasNew: false },
        { id: '7', username: 'usuario6', avatar: '', hasNew: true },
        { id: '8', username: 'usuario7', avatar: '', hasNew: false },
    ];

    const displayStories = stories.length > 0 ? stories : defaultStories;

    return (
        <div className="border-b bg-background">
            <div className="flex gap-4 overflow-x-auto p-4 scrollbar-hide">
                {displayStories.map((story, index) => (
                    <button
                        key={story.id}
                        className="flex flex-col items-center gap-1 flex-shrink-0"
                    >
                        <div
                            className={`relative ${
                                story.hasNew
                                    ? 'rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 p-[2px]'
                                    : ''
                            }`}
                        >
                            <div className="rounded-full bg-background p-[2px]">
                                <Avatar className="h-14 w-14">
                                    <AvatarImage src={story.avatar} />
                                    <AvatarFallback>
                                        {story.username[0].toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                            </div>
                            {index === 0 && (
                                <div className="absolute bottom-0 right-0 rounded-full bg-blue-500 p-0.5">
                                    <Plus className="h-3 w-3 text-white" />
                                </div>
                            )}
                        </div>
                        <span className="text-xs text-muted-foreground truncate max-w-[64px]">
                            {story.username}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
