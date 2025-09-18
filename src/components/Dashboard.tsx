import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface User {
  name: string;
  email: string;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  deadline: string;
}

interface DashboardProps {
  user: User;
  onLogout: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, onLogout }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: '1', type: 'income', amount: 50000, category: 'Зарплата', description: 'Основная работа', date: '2025-09-15' },
    { id: '2', type: 'expense', amount: 1200, category: 'Еда', description: 'Продукты', date: '2025-09-14' },
    { id: '3', type: 'expense', amount: 2500, category: 'Транспорт', description: 'Бензин', date: '2025-09-13' },
    { id: '4', type: 'income', amount: 15000, category: 'Фриланс', description: 'Проект по дизайну', date: '2025-09-12' },
    { id: '5', type: 'expense', amount: 800, category: 'Развлечения', description: 'Кино с друзьями', date: '2025-09-11' },
  ]);

  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', title: 'Отпуск в Европе', target: 150000, current: 45000, deadline: '2025-12-01' },
    { id: '2', title: 'Новый ноутбук', target: 80000, current: 25000, deadline: '2025-11-15' },
    { id: '3', title: 'Аварийный фонд', target: 200000, current: 120000, deadline: '2025-12-31' },
  ]);

  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
  });

  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false);

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const expensesByCategory = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const incomesByCategory = transactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const balanceHistory = [
    { month: 'Янв', balance: 45000 },
    { month: 'Фев', balance: 52000 },
    { month: 'Мар', balance: 48000 },
    { month: 'Апр', balance: 61000 },
    { month: 'Май', balance: 58000 },
    { month: 'Июн', balance: 63000 },
  ];

  const expenseData = Object.entries(expensesByCategory).map(([category, amount]) => ({
    name: category,
    value: amount,
  }));

  const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'];

  const addTransaction = () => {
    if (newTransaction.amount && newTransaction.category && newTransaction.description) {
      const transaction: Transaction = {
        id: Date.now().toString(),
        type: newTransaction.type,
        amount: parseFloat(newTransaction.amount),
        category: newTransaction.category,
        description: newTransaction.description,
        date: new Date().toISOString().split('T')[0],
      };
      setTransactions([transaction, ...transactions]);
      setNewTransaction({ type: 'expense', amount: '', category: '', description: '' });
      setIsAddTransactionOpen(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                <Icon name="Wallet" size={20} className="text-white" />
              </div>
              <h1 className="text-xl font-bold text-slate-900">FinTracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600">
                    <Icon name="Plus" size={16} className="mr-2" />
                    Добавить
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Добавить транзакцию</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label>Тип</Label>
                      <Select value={newTransaction.type} onValueChange={(value: 'income' | 'expense') => setNewTransaction({...newTransaction, type: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="income">Доход</SelectItem>
                          <SelectItem value="expense">Расход</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Сумма</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        value={newTransaction.amount}
                        onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Категория</Label>
                      <Input
                        placeholder="Например: Еда, Транспорт"
                        value={newTransaction.category}
                        onChange={(e) => setNewTransaction({...newTransaction, category: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label>Описание</Label>
                      <Input
                        placeholder="Описание транзакции"
                        value={newTransaction.description}
                        onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                      />
                    </div>
                    <Button onClick={addTransaction} className="w-full">
                      Добавить транзакцию
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
              
              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-medium text-slate-900">{user.name}</p>
                  <p className="text-xs text-slate-500">{user.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onLogout} title="Выйти">
                  <Icon name="LogOut" size={20} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Добро пожаловать, {user.name}! 👋
          </h2>
          <p className="text-slate-600">Вот обзор ваших финансов на сегодня</p>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-fade-in">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-xl hover-scale animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm font-medium">Общий баланс</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(balance)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon name="Wallet" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0 shadow-xl hover-scale animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium">Доходы</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(totalIncome)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingUp" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500 to-red-600 text-white border-0 shadow-xl hover-scale animate-scale-in">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-red-100 text-sm font-medium">Расходы</p>
                  <p className="text-3xl font-bold mt-1">{formatCurrency(totalExpenses)}</p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Icon name="TrendingDown" size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="space-y-6 animate-fade-in">
          <TabsList className="grid w-full grid-cols-4 lg:w-fit lg:grid-cols-8 bg-white shadow-sm">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Icon name="Home" size={16} />
              <span className="hidden sm:inline">Главная</span>
            </TabsTrigger>
            <TabsTrigger value="income" className="flex items-center space-x-2">
              <Icon name="TrendingUp" size={16} />
              <span className="hidden sm:inline">Доходы</span>
            </TabsTrigger>
            <TabsTrigger value="expenses" className="flex items-center space-x-2">
              <Icon name="TrendingDown" size={16} />
              <span className="hidden sm:inline">Расходы</span>
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center space-x-2">
              <Icon name="BarChart3" size={16} />
              <span className="hidden sm:inline">Статистика</span>
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center space-x-2">
              <Icon name="Target" size={16} />
              <span className="hidden sm:inline">Цели</span>
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center space-x-2">
              <Icon name="User" size={16} />
              <span className="hidden sm:inline">Профиль</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center space-x-2">
              <Icon name="Settings" size={16} />
              <span className="hidden sm:inline">Настройки</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <Icon name="PieChart" size={16} />
              <span className="hidden sm:inline">Аналитика</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Transactions */}
              <Card className="shadow-lg border-0 hover-scale">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Clock" size={20} />
                    <span>Последние транзакции</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            transaction.type === 'income' ? 'bg-green-100' : 'bg-red-100'
                          }`}>
                            <Icon 
                              name={transaction.type === 'income' ? 'ArrowUpRight' : 'ArrowDownRight'} 
                              size={16} 
                              className={transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}
                            />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{transaction.description}</p>
                            <p className="text-sm text-slate-500">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-sm text-slate-500">{new Date(transaction.date).toLocaleDateString('ru-RU')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Stats */}
              <Card className="shadow-lg border-0 hover-scale">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Icon name="Zap" size={20} />
                    <span>Быстрая статистика</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Средний расход в день</p>
                    <p className="text-2xl font-bold text-slate-900">{formatCurrency(totalExpenses / 30)}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Самая популярная категория</p>
                    <p className="text-lg font-semibold text-slate-900">
                      {Object.entries(expensesByCategory).sort(([,a], [,b]) => b - a)[0]?.[0] || 'Нет данных'}
                    </p>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg">
                    <p className="text-sm text-slate-600 mb-1">Экономия в этом месяце</p>
                    <p className="text-2xl font-bold text-green-600">
                      {balance > 0 ? `+${formatCurrency(balance)}` : formatCurrency(0)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Income */}
          <TabsContent value="income" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon name="TrendingUp" size={20} />
                  <span>Доходы по категориям</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(incomesByCategory).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">{category}</span>
                      </div>
                      <span className="font-bold text-green-600">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Expenses */}
          <TabsContent value="expenses" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon name="TrendingDown" size={20} />
                  <span>Расходы по категориям</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(expensesByCategory).map(([category, amount]) => (
                    <div key={category} className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <span className="font-medium">{category}</span>
                      </div>
                      <span className="font-bold text-red-600">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Динамика баланса</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={balanceHistory}>
                        <defs>
                          <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          formatter={(value) => [formatCurrency(Number(value)), 'Баланс']}
                          labelStyle={{ color: '#1e293b' }}
                          contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Area type="monotone" dataKey="balance" stroke="#3b82f6" fillOpacity={1} fill="url(#balanceGradient)" strokeWidth={3} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Распределение расходов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseData}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {expenseData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Сумма']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Goals */}
          <TabsContent value="goals" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon name="Target" size={20} />
                  <span>Финансовые цели</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {goals.map((goal) => {
                    const progress = (goal.current / goal.target) * 100;
                    return (
                      <div key={goal.id} className="p-4 bg-slate-50 rounded-lg space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold">{goal.title}</h3>
                          <Badge variant="outline">{Math.round(progress)}%</Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>{formatCurrency(goal.current)}</span>
                            <span>{formatCurrency(goal.target)}</span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor(progress)}`}
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-slate-500">До {new Date(goal.deadline).toLocaleDateString('ru-RU')}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Profile */}
          <TabsContent value="profile" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon name="User" size={20} />
                  <span>Профиль пользователя</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-2xl font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user.name}</h3>
                    <p className="text-slate-600">{user.email}</p>
                    <p className="text-slate-500 text-sm">Пользователь с января 2025</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-slate-600">Всего транзакций</p>
                    <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-slate-600">Активных целей</p>
                    <p className="text-2xl font-bold text-green-600">{goals.length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Icon name="Settings" size={20} />
                  <span>Настройки</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Уведомления</h4>
                      <p className="text-sm text-slate-600">Получать уведомления о новых транзакциях</p>
                    </div>
                    <Button variant="outline" size="sm">Настроить</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Валюта</h4>
                      <p className="text-sm text-slate-600">Российский рубль (RUB)</p>
                    </div>
                    <Button variant="outline" size="sm">Изменить</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">Экспорт данных</h4>
                      <p className="text-sm text-slate-600">Скачать все данные в формате CSV</p>
                    </div>
                    <Button variant="outline" size="sm">Скачать</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <h4 className="font-medium text-red-700">Удалить аккаунт</h4>
                      <p className="text-sm text-red-600">Удалить аккаунт и все данные навсегда</p>
                    </div>
                    <Button variant="destructive" size="sm">Удалить</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2 shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Динамика доходов и расходов</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[
                        { month: 'Янв', income: 65000, expenses: 23000 },
                        { month: 'Фев', income: 59000, expenses: 32000 },
                        { month: 'Мар', income: 80000, expenses: 45000 },
                        { month: 'Апр', income: 81000, expenses: 42000 },
                        { month: 'Май', income: 56000, expenses: 38000 },
                        { month: 'Июн', income: 65000, expenses: 44000 },
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="month" stroke="#64748b" />
                        <YAxis stroke="#64748b" />
                        <Tooltip 
                          formatter={(value, name) => [
                            formatCurrency(Number(value)), 
                            name === 'income' ? 'Доходы' : 'Расходы'
                          ]}
                          labelStyle={{ color: '#1e293b' }}
                          contentStyle={{ background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                        />
                        <Bar dataKey="income" fill="#22c55e" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-lg border-0">
                <CardHeader>
                  <CardTitle>Ключевые метрики</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-slate-600">Рост доходов</p>
                    <p className="text-xl font-bold text-blue-600">+12%</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-slate-600">Снижение расходов</p>
                    <p className="text-xl font-bold text-green-600">-8%</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="text-sm text-slate-600">Коэффициент сбережений</p>
                    <p className="text-xl font-bold text-purple-600">23%</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;