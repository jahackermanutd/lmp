'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/admin/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/admin/Table';
import { Download, TrendingUp, TrendingDown, Users, FileText } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mock data
const monthlyData = [
  { month: 'Jan', created: 45, approved: 38, rejected: 7 },
  { month: 'Feb', created: 52, approved: 44, rejected: 8 },
  { month: 'Mar', created: 61, approved: 55, rejected: 6 },
  { month: 'Apr', created: 48, approved: 42, rejected: 6 },
  { month: 'May', created: 70, approved: 63, rejected: 7 },
  { month: 'Jun', created: 68, approved: 61, rejected: 7 },
];

const statusData = [
  { name: 'Approved', value: 303, color: '#10b981' },
  { name: 'Pending', value: 45, color: '#f59e0b' },
  { name: 'Rejected', value: 41, color: '#ef4444' },
  { name: 'Draft', value: 22, color: '#6b7280' },
];

const topUsers = [
  { name: 'John Doe', letters: 48, approved: 42, rejected: 6, rate: '87.5%' },
  { name: 'Sarah Smith', letters: 45, approved: 40, rejected: 5, rate: '88.9%' },
  { name: 'Mike Johnson', letters: 42, approved: 35, rejected: 7, rate: '83.3%' },
  { name: 'Emma Wilson', letters: 38, approved: 33, rejected: 5, rate: '86.8%' },
  { name: 'David Brown', letters: 35, approved: 30, rejected: 5, rate: '85.7%' },
];

const categoryData = [
  { category: 'Contract', count: 85 },
  { category: 'Agreement', count: 72 },
  { category: 'Request', count: 68 },
  { category: 'Proposal', count: 55 },
  { category: 'Order', count: 48 },
  { category: 'Invitation', count: 43 },
];

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Insights and statistics about your letters</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option>Last 6 Months</option>
            <option>Last 3 Months</option>
            <option>This Year</option>
            <option>All Time</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Download size={20} />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Letters</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">411</p>
              <div className="flex items-center gap-1 mt-2 text-green-600">
                <TrendingUp size={16} />
                <span className="text-sm">+15.3%</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText size={24} className="text-blue-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Approval Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">73.7%</p>
              <div className="flex items-center gap-1 mt-2 text-green-600">
                <TrendingUp size={16} />
                <span className="text-sm">+2.1%</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <TrendingUp size={24} className="text-green-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg. Process Time</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">2.4 days</p>
              <div className="flex items-center gap-1 mt-2 text-red-600">
                <TrendingDown size={16} />
                <span className="text-sm">-0.3 days</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <TrendingDown size={24} className="text-yellow-600" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">47</p>
              <div className="flex items-center gap-1 mt-2 text-green-600">
                <TrendingUp size={16} />
                <span className="text-sm">+5</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users size={24} className="text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Letter Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="created" stroke="#3b82f6" strokeWidth={2} name="Created" />
                <Line type="monotone" dataKey="approved" stroke="#10b981" strokeWidth={2} name="Approved" />
                <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} name="Rejected" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => `${entry.name} ${(entry.percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <CardTitle>Letters by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Users */}
        <Card>
          <CardHeader>
            <CardTitle>Top Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Letters</TableHead>
                  <TableHead>Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topUsers.map((user, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.letters}</TableCell>
                    <TableCell>
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                        {user.rate}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
