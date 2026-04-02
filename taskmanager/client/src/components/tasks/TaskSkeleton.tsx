import { Skeleton } from "@/components/ui/skeleton";

function TaskSkeleton() { 
    return (
       <div className="bg-white rounded-lg border p-4 shadow-sm">
            {/* title row */}
            <div className="flex items-start justify-between gap-2 mb-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-16" />
            </div>

            {/* description */}
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-2/3 mb-3" />

            {/* status and due date */}
            <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-4 w-24" />
            </div>

            {/* buttons */}
            <div className="flex gap-2 justify-end">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-16" />
            </div>
        </div>
    )
}

export default TaskSkeleton;