import React, { useState } from 'react';
import LandingPage from '@/components/LandingPage';
import AuthModal from '@/components/AuthModal';
import Dashboard from '@/components/Dashboard';

interface User {
  name: string;
  email: string;
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  const handleLogin = async (email: string, password: string) => {
    // Симуляция авторизации - в реальном приложении здесь будет API вызов
    console.log('Login attempt:', { email, password });
    
    // Имитируем успешную авторизацию
    const userData = {
      name: email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1),
      email: email
    };
    
    setUser(userData);
    setIsAuthModalOpen(false);
    
    // Сохраняем пользователя в localStorage для персистентности
    localStorage.setItem('fintracker_user', JSON.stringify(userData));
  };

  const handleRegister = async (email: string, password: string, name: string) => {
    // Симуляция регистрации - в реальном приложении здесь будет API вызов
    console.log('Register attempt:', { email, password, name });
    
    // Имитируем успешную регистрацию
    const userData = {
      name: name,
      email: email
    };
    
    setUser(userData);
    setIsAuthModalOpen(false);
    
    // Сохраняем пользователя в localStorage для персистентности
    localStorage.setItem('fintracker_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('fintracker_user');
  };

  const handleSignIn = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  const handleSignUp = () => {
    setAuthModalTab('register');
    setIsAuthModalOpen(true);
  };

  // Проверяем есть ли сохранённый пользователь при загрузке
  React.useEffect(() => {
    const savedUser = localStorage.getItem('fintracker_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('fintracker_user');
      }
    }
  }, []);

  // Если пользователь авторизован, показываем дашборд
  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />;
  }

  // Если пользователь не авторизован, показываем лендинг
  return (
    <>
      <LandingPage onSignIn={handleSignIn} onSignUp={handleSignUp} />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
        defaultTab={authModalTab}
      />
    </>
  );
};

export default Index;