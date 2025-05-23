'use client';

import { useQuery } from '@tanstack/react-query';
import {
  CurrencyDollarIcon,
  CubeIcon,
  UserGroupIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';
import { formatCurrency } from '@/lib/utils';

interface DashboardStats {
  totalProducts: number;
  totalOffers: number;
  totalRevenue: number;
  activeUsers: number;
}

interface RecentActivity {
  _id: string;
  type: 'offer' | 'product';
  product: {
    _id: string;
    name: string;
    price: number;
  };
  user: {
    phoneNumber: string;
  };
  amount?: number;
  createdAt: string;
}

async function getDashboardStats() {
  const response = await fetch('/api/admin/stats');
  if (!response.ok) throw new Error('Failed to fetch dashboard stats');
  return response.json();
}

async function getRecentActivity() {
  const response = await fetch('/api/admin/activity');
  if (!response.ok) throw new Error('Failed to fetch recent activity');
  return response.json();
}

const stats = [
  {
    name: 'Total Products',
    value: '0',
    icon: CubeIcon,
    color: 'bg-blue-500',
  },
  {
    name: 'Total Offers',
    value: '0',
    icon: CurrencyDollarIcon,
    color: 'bg-green-500',
  },
  {
    name: 'Total Revenue',
    value: 'MWK 0',
    icon: ChartBarIcon,
    color: 'bg-purple-500',
  },
  {
    name: 'Active Users',
    value: '0',
    icon: UserGroupIcon,
    color: 'bg-yellow-500',
  },
];

export default function AdminDashboard() {
  const { data: dashboardStats, isLoading: isLoadingStats } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  const { data: recentActivity, isLoading: isLoadingActivity } = useQuery<RecentActivity[]>({
    queryKey: ['recentActivity'],
    queryFn: getRecentActivity,
  });

  if (isLoadingStats || isLoadingActivity) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Dashboard
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const value = index === 0
            ? dashboardStats?.totalProducts
            : index === 1
            ? dashboardStats?.totalOffers
            : index === 2
            ? formatCurrency(dashboardStats?.totalRevenue || 0)
            : dashboardStats?.activeUsers;

          return (
            <div
              key={stat.name}
              className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-gray-800 sm:p-6"
            >
              <div className="flex items-center">
                <div className={`rounded-md p-3 ${stat.color}`}>
                  <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-gray-500 dark:text-gray-400">
                      {stat.name}
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold tracking-tight text-gray-900 dark:text-white">
                      {value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Recent Activity
        </h2>
        <div className="mt-4 overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <ul role="list" className="divide-y divide-gray-200 dark:divide-gray-700">
            {recentActivity?.map((activity) => (
              <li key={activity._id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      {activity.type === 'offer' ? (
                        <CurrencyDollarIcon className="h-5 w-5 text-green-500" />
                      ) : (
                        <CubeIcon className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.type === 'offer'
                          ? `New offer of ${formatCurrency(activity.amount!)} on ${activity.product.name}`
                          : `New product listed: ${activity.product.name}`}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        by {activity.user.phoneNumber}
                      </p>
                    </div>
                  </div>
                  <div className="ml-2 flex-shrink-0">
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
} 