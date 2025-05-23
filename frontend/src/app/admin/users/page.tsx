'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { formatPhoneNumber } from '@/lib/utils';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ShieldCheckIcon,
  ShieldExclamationIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface User {
  _id: string;
  phoneNumber: string;
  role: 'user' | 'admin';
  status: 'active' | 'suspended';
  createdAt: string;
  lastLogin?: string;
}

async function getUsers() {
  const response = await fetch('/api/admin/users');
  if (!response.ok) throw new Error('Failed to fetch users');
  return response.json();
}

async function updateUserRole(id: string, role: User['role']) {
  const response = await fetch(`/api/admin/users/${id}/role`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) throw new Error('Failed to update user role');
  return response.json();
}

async function updateUserStatus(id: string, status: User['status']) {
  const response = await fetch(`/api/admin/users/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!response.ok) throw new Error('Failed to update user status');
  return response.json();
}

async function deleteUser(id: string) {
  const response = await fetch(`/api/admin/users/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) throw new Error('Failed to delete user');
  return response.json();
}

export default function AdminUsers() {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data: users, isLoading } = useQuery<User[]>({
    queryKey: ['adminUsers'],
    queryFn: getUsers,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: User['role'] }) =>
      updateUserRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User role updated successfully');
    },
    onError: () => {
      toast.error('Failed to update user role');
    },
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: User['status'] }) =>
      updateUserStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User status updated successfully');
    },
    onError: () => {
      toast.error('Failed to update user status');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
      toast.success('User deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete user');
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Users
          </h1>
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            Manage user accounts and their permissions.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 dark:bg-primary-500 dark:hover:bg-primary-600"
          >
            <PlusIcon className="inline-block h-5 w-5" /> Add User
          </button>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6"
                    >
                      Phone Number
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Role
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Created
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Last Login
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-6"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-900">
                  {users?.map((user) => (
                    <tr key={user._id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                        {formatPhoneNumber(user.phoneNumber)}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <select
                          value={user.role}
                          onChange={(e) =>
                            roleMutation.mutate({
                              id: user._id,
                              role: e.target.value as User['role'],
                            })
                          }
                          className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <select
                          value={user.status}
                          onChange={(e) =>
                            statusMutation.mutate({
                              id: user._id,
                              status: e.target.value as User['status'],
                            })
                          }
                          className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                        >
                          <option value="active">Active</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-primary-600 hover:text-primary-900 dark:text-primary-400 dark:hover:text-primary-300"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Are you sure you want to delete this user?')) {
                              deleteMutation.mutate(user._id);
                            }
                          }}
                          className="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create/Edit User Modal will be added here */}
    </div>
  );
} 