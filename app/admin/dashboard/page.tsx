'use client';

import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/admin/Card';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data
const stats = [
  {
    title: 'Jami xatlar',
    value: '248',
    change: '+12%',
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Kutilmoqda',
    value: '18',
    change: '+4',
    icon: Clock,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    title: 'Tasdiqlangan',
    value: '215',
    change: '+8%',
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Foydalanuvchilar',
    value: '47',
    change: '+2',
    icon: Users,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

const chartData = [
  { month: 'Yan', Xatlar: 12 },
  { month: 'Fev', Xatlar: 19 },
  { month: 'Mar', Xatlar: 25 },
  { month: 'Apr', Xatlar: 31 },
  { month: 'May', Xatlar: 28 },
  { month: 'Iyun', Xatlar: 35 },
];

const recentActivity = [
  {
    id: 1,
    user: 'Sardor Aliyev',
    action: 'yangi xat yaratdi',
    letter: 'Shartnoma uzaytirish so\'rovi',
    time: '5 daqiqa oldin',
    type: 'create',
  },
  {
    id: 2,
    user: 'Madina Karimova',
    action: 'xatni tasdiqladi',
    letter: 'O\'tkazma hujjati',
    time: '1 soat oldin',
    type: 'approve',
  },
  {
    id: 3,
    user: 'Bobur Rahimov',
    action: 'xatni rad etdi',
    letter: 'Homiylik shartnomasi',
    time: '2 soat oldin',
    type: 'reject',
  },
  {
    id: 4,
    user: 'Nilufar Sharipova',
    action: 'xatni yangiladi',
    letter: 'Stadion ijarasi shartnomasi',
    time: '3 soat oldin',
    type: 'update',
  },
  {
    id: 5,
    user: 'Timur Nasriddinov',
    action: 'yangi foydalanuvchi qo\'shdi',
    letter: 'aziz@ebolt.uz',
    time: '5 soat oldin',
    type: 'user',
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Boshqaruv paneli</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Xush kelibsiz! Bugungi yangiliklar.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="text-xs sm:text-sm text-gray-600">{stat.title}</p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-green-600 mt-1">{stat.change} o'tgan oyga nisbatan</p>
                </div>
                <div className={`${stat.bgColor} ${stat.color} p-2 sm:p-3 rounded-lg flex-shrink-0`}>
                  <Icon size={20} className="sm:w-6 sm:h-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Charts and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Yaratilgan xatlar (So'nggi 6 oy)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="Xatlar" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">So'nggi faoliyat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4 max-h-[300px] overflow-y-auto">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-2 sm:gap-3 pb-3 sm:pb-4 border-b border-gray-100 last:border-0">
                  <div className={`w-2 h-2 mt-2 rounded-full flex-shrink-0 ${
                    activity.type === 'approve' ? 'bg-green-500' :
                    activity.type === 'reject' ? 'bg-red-500' :
                    activity.type === 'create' ? 'bg-blue-500' :
                    activity.type === 'update' ? 'bg-yellow-500' :
                    'bg-purple-500'
                  }`}></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                    </p>
                    <p className="text-xs sm:text-sm text-blue-600 mt-1 truncate">{activity.letter}</p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
