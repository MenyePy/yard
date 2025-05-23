'use client';

import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  CubeIcon,
} from '@heroicons/react/24/outline';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { formatCurrency } from '@/lib/utils';

interface AnalyticsData {
  revenueByDay: { date: string; amount: number }[];
  productsByStatus: { status: string; count: number }[];
  offersByDay: { date: string; count: number }[];
  userActivity: { date: string; activeUsers: number }[];
  topProducts: {
    _id: string;
    name: string;
    totalOffers: number;
    highestOffer: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

async function getAnalytics() {
  const response = await fetch('/api/admin/analytics');
  if (!response.ok) throw new Error('Failed to fetch analytics');
  return response.json();
}

export default function AdminAnalytics() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['adminAnalytics'],
    queryFn: getAnalytics,
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
        Analytics
      </h1>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Revenue Chart */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Revenue Over Time
          </h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.revenueByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6B7280' }}
                  stroke="#6B7280"
                />
                <YAxis
                  tick={{ fill: '#6B7280' }}
                  stroke="#6B7280"
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.375rem',
                    color: '#F9FAFB',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="amount"
                  stroke="#6366F1"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Products by Status */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Products by Status
          </h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.productsByStatus}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analytics?.productsByStatus.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.375rem',
                    color: '#F9FAFB',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Offers Over Time */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            Offers Over Time
          </h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.offersByDay}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6B7280' }}
                  stroke="#6B7280"
                />
                <YAxis
                  tick={{ fill: '#6B7280' }}
                  stroke="#6B7280"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.375rem',
                    color: '#F9FAFB',
                  }}
                />
                <Bar dataKey="count" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Activity */}
        <div className="rounded-lg bg-white p-6 shadow dark:bg-gray-800">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white">
            User Activity
          </h2>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.userActivity}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#6B7280' }}
                  stroke="#6B7280"
                />
                <YAxis
                  tick={{ fill: '#6B7280' }}
                  stroke="#6B7280"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '0.375rem',
                    color: '#F9FAFB',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="activeUsers"
                  stroke="#6366F1"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Products */}
      <div className="mt-8">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white">
          Top Products
        </h2>
        <div className="mt-4 overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                >
                  Product
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                >
                  Total Offers
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-300"
                >
                  Highest Offer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {analytics?.topProducts.map((product) => (
                <tr key={product._id}>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {product.name}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {product.totalOffers}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                    {formatCurrency(product.highestOffer)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 