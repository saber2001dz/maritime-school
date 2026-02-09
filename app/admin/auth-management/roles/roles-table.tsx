"use client"

import { useState } from "react"
import { Eye, UserPlus, Edit, Plus } from "lucide-react"
import { DialogueViewUsers } from "./dialogue-view-users"
import { DialogueAssignRole } from "./dialogue-assign-role"
import { DialogueEditRole, type RoleFormData } from "./dialogue-edit-role"

export interface Role {
  name: string
  displayName: string
  description: string
  permissions: string[]
  color: string
  userCount: number
  isSystem?: boolean
}

export interface SimpleUser {
  id: string
  name: string
  email: string
  role: string
}

interface RolesTableProps {
  roles: Role[]
  users: SimpleUser[]
  onAssignRole?: (userId: string, role: string) => Promise<{ success: boolean; error?: string }>
  onRemoveRole?: (userId: string) => Promise<{ success: boolean; error?: string }>
  onCreateRole?: (data: RoleFormData) => Promise<{ success: boolean; error?: string }>
  onEditRole?: (data: RoleFormData) => Promise<{ success: boolean; error?: string }>
  onDeleteRole?: (name: string) => Promise<{ success: boolean; error?: string }>
  isUpdating?: boolean
}

export function RolesTable({ roles, users, onAssignRole, onRemoveRole, onCreateRole, onEditRole, onDeleteRole, isUpdating }: RolesTableProps) {
  const [viewUsersDialogOpen, setViewUsersDialogOpen] = useState(false)
  const [assignRoleDialogOpen, setAssignRoleDialogOpen] = useState(false)
  const [editRoleDialogOpen, setEditRoleDialogOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [editingRole, setEditingRole] = useState<RoleFormData | null>(null)
  const [editingIsSystem, setEditingIsSystem] = useState(false)

  const handleViewUsers = (role: Role) => {
    setSelectedRole(role)
    setViewUsersDialogOpen(true)
  }

  const handleAssignRole = () => {
    setAssignRoleDialogOpen(true)
  }

  const handleCreateRole = () => {
    setEditingRole(null)
    setEditingIsSystem(false)
    setEditRoleDialogOpen(true)
  }

  const handleEditRole = (role: Role) => {
    setEditingRole({
      name: role.name,
      displayName: role.displayName,
      description: role.description,
      color: role.color,
    })
    setEditingIsSystem(role.isSystem || false)
    setEditRoleDialogOpen(true)
  }

  const handleSaveRole = async (data: RoleFormData) => {
    if (editingRole) {
      return onEditRole ? onEditRole(data) : { success: false, error: "Edition non disponible" }
    } else {
      return onCreateRole ? onCreateRole(data) : { success: false, error: "Creation non disponible" }
    }
  }

  return (
    <div className="p-4">
      <div className="mb-4 flex justify-end gap-2">
        {onCreateRole && (
          <button
            onClick={handleCreateRole}
            className="px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 transition-colors flex items-center gap-2 rounded-md shadow-sm cursor-pointer"
          >
            <Plus size={16} />
            Creer un role
          </button>
        )}
        <button
          onClick={handleAssignRole}
          className="px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2 rounded-md shadow-sm cursor-pointer"
        >
          <UserPlus size={16} />
          Assigner un role
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-4 py-3 text-left text-sm font-medium">Role</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Description</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Permissions</th>
              <th className="px-4 py-3 text-center text-sm font-medium">Users</th>
              <th className="px-4 py-3 text-center text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.name} className="border-t hover:bg-gray-50 dark:hover:bg-gray-700/50">
                <td className="px-4 py-3 font-medium">{role.displayName}</td>
                <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{role.description}</td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {role.permissions.slice(0, 3).map((perm, i) => (
                      <span key={i} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded">
                        {perm}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                        +{role.permissions.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
                    {role.userCount}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button
                      onClick={() => handleViewUsers(role)}
                      className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors cursor-pointer"
                      title="Voir les utilisateurs"
                    >
                      <Eye size={16} className="text-blue-600" />
                    </button>
                    {onEditRole && (
                      <button
                        onClick={() => handleEditRole(role)}
                        className="p-1.5 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded transition-colors cursor-pointer"
                        title="Modifier le role"
                      >
                        <Edit size={16} className="text-amber-600" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <DialogueViewUsers
        isOpen={viewUsersDialogOpen}
        onClose={() => {
          setViewUsersDialogOpen(false)
          setSelectedRole(null)
        }}
        roleName={selectedRole?.name || ""}
        roleDisplayName={selectedRole?.displayName || ""}
        users={users}
        onRemoveRole={onRemoveRole}
      />

      <DialogueAssignRole
        isOpen={assignRoleDialogOpen}
        onClose={() => setAssignRoleDialogOpen(false)}
        users={users}
        roles={roles}
        onAssignRole={onAssignRole}
      />

      <DialogueEditRole
        isOpen={editRoleDialogOpen}
        onClose={() => {
          setEditRoleDialogOpen(false)
          setEditingRole(null)
        }}
        role={editingRole}
        isSystem={editingIsSystem}
        onSave={handleSaveRole}
        onDelete={onDeleteRole}
        isUpdating={isUpdating}
      />
    </div>
  )
}
