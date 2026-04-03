import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { X } from 'lucide-react';

//filter state shape will be passed to DashboardPage and used to filter tasks
export interface FilterState {
    search: string;
    status: string;
    priority: string;
}

interface TaskFilterProps {
    filters: FilterState;
    onFilterChange: (filters: FilterState) => void;
    onClear: () => void;
}

function TaskFilter({filters, onFilterChange, onClear}: TaskFilterProps) { 
    

    const hasActiveFilters = filters.search !== '' || filters.status !== 'ALL' || filters.priority !== 'ALL';


    return (
         <div className="flex flex-col sm:flex-row gap-3 mb-6">

            {/* search by title */}
            <Input
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) =>
                    onFilterChange({ ...filters, search: e.target.value })
                }
                className="sm:max-w-xs"
            />

            {/* filter by status */}
            <Select
                value={filters.status}
                onValueChange={(value) =>
                    onFilterChange({ ...filters, status: value })
                }
            >
                <SelectTrigger className="sm:w-40">
                    <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Statuses</SelectItem>
                    <SelectItem value="TODO">To Do</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="DONE">Done</SelectItem>
                    <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
            </Select>

            {/* filter by priority */}
            <Select
                value={filters.priority}
                onValueChange={(value) =>
                    onFilterChange({ ...filters, priority: value })
                }
            >
                <SelectTrigger className="sm:w-40">
                    <SelectValue placeholder="All Priorities" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="ALL">All Priorities</SelectItem>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
            </Select>

            {/* clear filters button — only shows when a filter is active */}
            {hasActiveFilters && (
                <Button
                    variant="outline"
                    onClick={onClear}
                    className="flex items-center gap-1"
                >
                    <X className="h-4 w-4" />
                    Clear
                </Button>
            )}
        </div>
    )
} 

export default TaskFilter;