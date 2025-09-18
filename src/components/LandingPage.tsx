import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface LandingPageProps {
  onSignIn: () => void;
  onSignUp: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSignIn, onSignUp }) => {
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
              <Button variant="ghost" onClick={onSignIn}>
                Войти
              </Button>
              <Button 
                onClick={onSignUp}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
              >
                Регистрация
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="animate-fade-in">
            <h1 className="text-5xl font-bold text-slate-900 mb-6">
              Управляйте финансами 
              <span className="bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent"> легко</span>
            </h1>
            <p className="text-xl text-slate-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Современный финансовый трекер для контроля доходов, расходов и достижения финансовых целей. 
              Ваши данные полностью конфиденциальны и защищены.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                onClick={onSignUp}
                className="bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-lg px-8 py-4"
              >
                <Icon name="Rocket" size={20} className="mr-2" />
                Начать бесплатно
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={onSignIn}
                className="text-lg px-8 py-4 border-2 hover:bg-slate-50"
              >
                <Icon name="LogIn" size={20} className="mr-2" />
                У меня есть аккаунт
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Возможности FinTracker</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Все инструменты для эффективного управления личными финансами в одном месте
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover-scale animate-scale-in border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="TrendingUp" size={24} className="text-white" />
                </div>
                <CardTitle className="text-xl">Учёт доходов и расходов</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Добавляйте транзакции по категориям, отслеживайте куда уходят деньги и откуда поступают доходы.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale animate-scale-in border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="BarChart3" size={24} className="text-white" />
                </div>
                <CardTitle className="text-xl">Интерактивная аналитика</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Красивые графики и диаграммы покажут динамику ваших финансов и помогут принимать решения.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale animate-scale-in border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Target" size={24} className="text-white" />
                </div>
                <CardTitle className="text-xl">Финансовые цели</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Ставьте цели и отслеживайте прогресс накоплений на отпуск, покупки или аварийный фонд.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale animate-scale-in border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Shield" size={24} className="text-white" />
                </div>
                <CardTitle className="text-xl">Безопасность данных</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Ваши финансовые данные полностью конфиденциальны и защищены современными методами шифрования.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale animate-scale-in border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Download" size={24} className="text-white" />
                </div>
                <CardTitle className="text-xl">Экспорт отчётов</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Выгружайте данные в Excel или CSV для ведения расширенной отчётности и налогового учёта.
                </p>
              </CardContent>
            </Card>

            <Card className="hover-scale animate-scale-in border-0 shadow-lg bg-white">
              <CardHeader>
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center mb-4">
                  <Icon name="Smartphone" size={24} className="text-white" />
                </div>
                <CardTitle className="text-xl">Доступ везде</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-600">
                  Адаптивный дизайн позволяет удобно пользоваться трекером с любого устройства — телефона, планшета или компьютера.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Preview */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Интерфейс трекера</h2>
            <p className="text-lg text-slate-600">
              Интуитивно понятный и современный дизайн для эффективной работы
            </p>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-slate-100 to-blue-100 rounded-2xl p-8 shadow-2xl">
              {/* Mock Dashboard Preview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-blue-100 text-sm">Общий баланс</p>
                      <p className="text-2xl font-bold">125 000 ₽</p>
                    </div>
                    <Icon name="Wallet" size={32} className="text-white/80" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-green-100 text-sm">Доходы</p>
                      <p className="text-2xl font-bold">180 000 ₽</p>
                    </div>
                    <Icon name="TrendingUp" size={32} className="text-white/80" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-red-100 text-sm">Расходы</p>
                      <p className="text-2xl font-bold">55 000 ₽</p>
                    </div>
                    <Icon name="TrendingDown" size={32} className="text-white/80" />
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-4">Последние транзакции</h3>
                  <div className="space-y-3">
                    {[
                      { desc: 'Продукты в магазине', amount: '-2 500 ₽', type: 'expense' },
                      { desc: 'Фриланс проект', amount: '+45 000 ₽', type: 'income' },
                      { desc: 'Кафе с друзьями', amount: '-1 200 ₽', type: 'expense' },
                    ].map((transaction, index) => (
                      <div key={index} className="flex items-center justify-between py-2">
                        <span className="text-slate-700">{transaction.desc}</span>
                        <span className={transaction.type === 'income' ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                          {transaction.amount}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-white rounded-xl p-6 shadow-sm">
                  <h3 className="font-semibold text-slate-900 mb-4">Финансовые цели</h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-700">Отпуск в Европе</span>
                        <span className="text-sm text-slate-500">45%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-slate-700">Новый ноутбук</span>
                        <span className="text-sm text-slate-500">70%</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Начните контролировать свои финансы уже сегодня
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Присоединяйтесь к тысячам пользователей, которые уже улучшили своё финансовое благополучие
          </p>
          <Button 
            size="lg" 
            onClick={onSignUp}
            className="bg-white text-blue-600 hover:bg-blue-50 text-lg px-8 py-4 font-semibold"
          >
            Создать бесплатный аккаунт
            <Icon name="ArrowRight" size={20} className="ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <Icon name="Wallet" size={20} className="text-white" />
                </div>
                <h3 className="text-xl font-bold">FinTracker</h3>
              </div>
              <p className="text-slate-400 mb-4">
                Современный финансовый трекер для управления личными финансами. 
                Безопасно, удобно, эффективно.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Продукт</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Возможности</li>
                <li>Безопасность</li>
                <li>Мобильное приложение</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Поддержка</h4>
              <ul className="space-y-2 text-slate-400">
                <li>Помощь</li>
                <li>Контакты</li>
                <li>Конфиденциальность</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 pt-8 text-center text-slate-400">
            <p>&copy; 2025 FinTracker. Все права защищены.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;