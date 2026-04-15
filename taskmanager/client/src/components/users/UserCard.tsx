import type { UserRole, UserSummary } from '@/hooks/useUsers'
import React from 'react'
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2 } from 'lucide-react';
import {Shield} from "lucide-react";


interface UserCardProps {
   currentUserId: number | undefined;
    users: UserSummary[];
    isLoading: boolean;
    roleDrafts: Record<number, UserRole>;
    setRoleDrafts: React.Dispatch<React.SetStateAction<Record<number,UserRole>>>;
    handleRoleSave: (user: UserSummary) => void;
    handleDeleteUserClick: (user: UserSummary) => void;
}

const UserCard = ({ currentUserId, users, isLoading, roleDrafts, handleRoleSave, handleDeleteUserClick, setRoleDrafts }: UserCardProps) => {

   

  return (

    <div>
        {isLoading ? (
           <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="rounded-lg border bg-white p-4 shadow-sm animate-pulse">
          <div className="h-4 w-1/2 rounded bg-gray-200 mb-3" />
          <div className="h-3 w-2/3 rounded bg-gray-100 mb-2" />
          <div className="h-8 w-full rounded bg-gray-100 mb-3" />
          <div className="h-8 w-1/3 rounded bg-gray-200 ml-auto" />
        </div>
      ))}
    </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {users.map((adminUser : UserSummary) => {
        const draftRole = roleDrafts[adminUser.id] ?? adminUser.role;
        const canDeleteCurrentUser = currentUserId !== adminUser.id;

        return (
          <Card key={adminUser.id} className="shadow-sm">
            <CardHeader className="space-y-1">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <CardTitle className="text-lg">{adminUser.name}</CardTitle>
                  <CardDescription>{adminUser.email}</CardDescription>
                </div>
                {currentUserId === adminUser.id && (
                  <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-medium text-indigo-700">
                    You
                  </span>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Shield className="h-4 w-4" />
                <span>Role</span>
              </div>

              <Select
                value={draftRole}
                onValueChange={(value) =>
                  setRoleDrafts((prev) => ({ ...prev, [adminUser.id]: value as UserRole }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USER">USER</SelectItem>
                  <SelectItem value="TRIAGE">TRIAGE</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-between gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRoleSave(adminUser)}
                  disabled={draftRole === adminUser.role}
                >
                  Save role
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteUserClick(adminUser)}
                  disabled={!canDeleteCurrentUser}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
        )}
    </div>
  )
}
    
export default UserCard
