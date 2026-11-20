/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';

type ViewMode = 'landing' | 'login' | 'register' | 'dashboard';

interface RegisteredAccount {
  name: string;
  email: string;
  password: string;
}

const ACCOUNTS_STORAGE_KEY = 'atur_registered_accounts';
const LOGIN_ERROR_MESSAGE = 'Email atau password salah. Silakan periksa kembali atau daftar akun terlebih dahulu.';

function loadStoredAccounts(): RegisteredAccount[] {
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [currentView, setCurrentView] = useState<ViewMode>('landing');

  // Registered Accounts & Active Session
  const [registeredAccounts, setRegisteredAccounts] = useState<RegisteredAccount[]>(loadStoredAccounts);
  const [currentUser, setCurrentUser] = useState<RegisteredAccount | null>(null);

  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginRememberMe, setLoginRememberMe] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Register form states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [regRememberMe, setRegRememberMe] = useState(false);
  const [registerError, setRegisterError] = useState<string | null>(null);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const persistAccounts = (accounts: RegisteredAccount[]) => {
    setRegisteredAccounts(accounts);
    try {
      window.localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
    } catch {
      // Ignore storage quota errors
    }
  };

  // Always start on Landing Page on initial load; listen to hashchange for subsequent navigation
  useEffect(() => {
    const initialHash = window.location.hash.replace('#', '');
    if (initialHash === 'login' || initialHash === 'register' || initialHash === 'dashboard') {
      window.history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    setCurrentView('landing');
    setLoginError(null);
    setRegisterError(null);
  }, []);

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'dashboard') {
        if (currentUser) {
          setCurrentView('dashboard');
        } else {
          setCurrentView('login');
          window.location.hash = 'login';
          setLoginError(LOGIN_ERROR_MESSAGE);
        }
      } else if (hash === 'login' || hash === 'register' || hash === 'landing') {
        setCurrentView(hash as ViewMode);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentUser]);

  const switchView = (view: ViewMode) => {
    if (view === 'dashboard' && !currentUser) {
      setLoginError(LOGIN_ERROR_MESSAGE);
      showToast(LOGIN_ERROR_MESSAGE);
      setCurrentView('login');
      window.location.hash = 'login';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLoginError(null);
    setRegisterError(null);
    setCurrentView(view);
    window.location.hash = view;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = loginEmail.trim().toLowerCase();
    const matchedAccount = registeredAccounts.find(
      (acc) => acc.email.toLowerCase() === normalizedEmail
    );

    if (!matchedAccount || matchedAccount.password !== loginPassword) {
      setLoginError(LOGIN_ERROR_MESSAGE);
      showToast(LOGIN_ERROR_MESSAGE);
      return;
    }

    setLoginError(null);
    setCurrentUser(matchedAccount);
    showToast('Login berhasil! Selamat datang di ATUR.');
    setTimeout(() => {
      setCurrentView('dashboard');
      window.location.hash = 'dashboard';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 450);
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = regName.trim();
    const normalizedEmail = regEmail.trim().toLowerCase();

    if (!trimmedName || !normalizedEmail || regPassword.length < 8) {
      const msg = 'Lengkapi semua data pendaftaran dengan password minimal 8 karakter.';
      setRegisterError(msg);
      showToast(msg);
      return;
    }

    if (regPassword !== regConfirmPassword) {
      const msg = 'Konfirmasi password tidak cocok! Silakan periksa kembali.';
      setRegisterError(msg);
      showToast(msg);
      return;
    }

    if (registeredAccounts.some((acc) => acc.email.toLowerCase() === normalizedEmail)) {
      const msg = 'Email sudah terdaftar. Silakan masuk menggunakan akun Anda.';
      setRegisterError(msg);
      showToast(msg);
      return;
    }

    const newAccount: RegisteredAccount = {
      name: trimmedName,
      email: normalizedEmail,
      password: regPassword,
    };

    const nextAccounts = [...registeredAccounts, newAccount];
    persistAccounts(nextAccounts);
    setRegisterError(null);
    setCurrentUser(newAccount);
    showToast('Pendaftaran berhasil! Akun ATUR Anda telah dibuat.');
    setTimeout(() => {
      setCurrentView('dashboard');
      window.location.hash = 'dashboard';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 450);
  };

  const handleSocialAuth = (provider: string, mode: 'login' | 'register') => {
    const providerEmail = `user.${provider.toLowerCase()}@atur.app`;
    if (mode === 'login') {
      const existing = registeredAccounts.find(
        (acc) => acc.email.toLowerCase() === providerEmail
      );
      if (!existing) {
        setLoginError(LOGIN_ERROR_MESSAGE);
        showToast(LOGIN_ERROR_MESSAGE);
        return;
      }
      setLoginError(null);
      setCurrentUser(existing);
      showToast(`Autentikasi dengan ${provider} berhasil!`);
      setTimeout(() => {
        setCurrentView('dashboard');
        window.location.hash = 'dashboard';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 450);
      return;
    }

    const existing = registeredAccounts.find(
      (acc) => acc.email.toLowerCase() === providerEmail
    );
    const account = existing || {
      name: `Pengguna ${provider}`,
      email: providerEmail,
      password: `${provider}-oauth`,
    };
    if (!existing) {
      persistAccounts([...registeredAccounts, account]);
    }
    setRegisterError(null);
    setCurrentUser(account);
    showToast(`Pendaftaran dengan ${provider} berhasil!`);
    setTimeout(() => {
      setCurrentView('dashboard');
      window.location.hash = 'dashboard';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 450);
  };

  return (
    <div className="min-h-screen text-slate-900 selection:bg-blue-100 selection:text-blue-700">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white text-sm font-medium px-5 py-3 rounded-xl shadow-xl transition-all flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span>{toastMessage}</span>
        </div>
      )}


      {/* ========================================================================= */}
      {/* 1. LANDING PAGE VIEW (100% Matching Landing_Page__1__a9459e13.png)        */}
      {/* Featuring the Hero Isometric Illustration side-by-side with Hero text    */}
      {/* ========================================================================= */}
      {currentView === 'landing' && (
        <div className="bg-canvas-gradient min-h-screen flex flex-col justify-between">
          
          {/* Top Navbar */}
          <header className="atur-navbar">
            <div className="atur-container h-20 md:h-24 flex items-center justify-between">
              {/* Logo ATUR */}
              <button
                onClick={() => switchView('landing')}
                className="flex items-center group cursor-pointer border-none bg-transparent p-0"
              >
                <img
                  src="/logo-atur.png"
                  alt="ATUR"
                  className="h-8 md:h-9 w-auto object-contain transition-transform group-hover:scale-105"
                />
              </button>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-10 text-[15px] font-medium text-slate-700">
                <a href="#home" className="atur-nav-link">
                  Home
                </a>
                <a href="#fitur" className="atur-nav-link">
                  Fitur
                </a>
                <a href="#about" className="atur-nav-link">
                  About Us
                </a>
              </nav>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-3 md:gap-4">
                <button
                  onClick={() => switchView('login')}
                  className="text-[15px] font-medium text-slate-700 hover:text-blue-600 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Login
                </button>
                <button
                  onClick={() => switchView('register')}
                  className="text-[15px] font-semibold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] px-6 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  Register
                </button>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="atur-container flex-grow w-full">
            
            {/* HERO SECTION WITH RIGHT SIDE ISOMETRIC ILLUSTRATION (Matching Landing_Page__1__a9459e13.png) */}
            <section id="home" className="pt-12 pb-16 md:pt-16 md:pb-24">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-10 lg:gap-8">
                
                {/* Left Side: Hero Text & Actions */}
                <div className="w-full lg:w-[48%] max-w-xl flex-shrink-0">
                  <h1 className="text-[40px] sm:text-[48px] md:text-[54px] font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                    Atur Uangmu,Tenangkan
                    <br />
                    Pikiranmu.
                  </h1>
                  <p className="mt-6 text-slate-600 text-base md:text-[17px] leading-relaxed max-w-xl">
                    Catat pemasukan, pantau pengeluaran, susun anggaran, dan wujudkan tujuan menabung dalam satu tempat yang jernih dan dirancang khusus untuk mahasiswa.
                  </p>
                  <div className="mt-9 flex flex-wrap items-center gap-4">
                    <button
                      onClick={() => switchView('register')}
                      className="bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white font-semibold text-[15px] px-7 py-3.5 rounded-xl transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
                    >
                      Mulai Atur Keuangan
                    </button>
                    <a
                      href="#fitur"
                      className="inline-flex items-center justify-center bg-white hover:bg-slate-50 active:scale-[0.98] border border-slate-300 text-slate-700 font-medium text-[15px] px-7 py-3.5 rounded-xl transition-all cursor-pointer"
                    >
                      Lihat Fitur
                    </a>
                  </div>
                </div>

                {/* Right Side: Hero Isometric Illustration (Matching Landing_Page__1__a9459e13.png) */}
                <div className="w-full lg:w-[52%] flex justify-center lg:justify-end">
                  <img
                    src="/illustration-isometric-trans.png"
                    alt="Ilustrasi Isometric ATUR"
                    className="w-full max-w-[620px] lg:max-w-[700px] xl:max-w-[740px] h-auto object-contain select-none pointer-events-none drop-shadow-sm"
                  />
                </div>

              </div>
            </section>

            {/* SECTION: FITUR UTAMA */}
            <section id="fitur" className="py-14 md:py-20">
              <div className="text-center">
                <p className="text-[13px] md:text-[14px] font-bold tracking-wider text-blue-600 uppercase">
                  FITUR UTAMA
                </p>
                <h2 className="mt-3 text-2xl md:text-[34px] font-extrabold text-slate-900 tracking-tight leading-snug">
                  Semua yang Kamu Butuhkan untuk
                  <br />
                  Mengatur Keuangan
                </h2>
              </div>

              {/* 4 Cards Grid - 300px each with 40px gap matching 1320px layout */}
              <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                
                {/* Card 1 */}
                <div className="atur-feature-card group">
                  <h3 className="font-bold text-slate-900 text-[17px] leading-snug h-12 flex items-center justify-center text-center">
                    Catat Pemasukan &amp;
                    <br />
                    Pengeluaran
                  </h3>
                  <div className="my-7 flex items-center justify-center h-20 w-20">
                    <img
                      src="/feature-icon1.png"
                      alt="Catat Pemasukan & Pengeluaran"
                      className="h-[72px] w-auto object-contain transition-transform group-hover:scale-105"
                    />
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    Pencatatan manual yang cepat dan terstruktur. Pisahkan sumber uang saku, beasiswa, hingga gaji part-time secara instan.
                  </p>
                </div>

                {/* Card 2 */}
                <div className="atur-feature-card group">
                  <h3 className="font-bold text-slate-900 text-[17px] leading-snug h-12 flex items-center justify-center text-center">
                    Atur Budget Bulanan
                  </h3>
                  <div className="my-7 flex items-center justify-center h-20 w-20">
                    <img
                      src="/feature-icon2.png"
                      alt="Atur Budget Bulanan"
                      className="h-[72px] w-auto object-contain transition-transform group-hover:scale-105"
                    />
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    Tetapkan batas maksimal tiap kategori pengeluaran agar uang bulanan tidak habis di pertengahan bulan karena impulsif.
                  </p>
                </div>

                {/* Card 3 */}
                <div className="atur-feature-card group">
                  <h3 className="font-bold text-slate-900 text-[17px] leading-snug h-12 flex items-center justify-center text-center">
                    Pantau Analisis
                    <br />
                    Pengeluaran
                  </h3>
                  <div className="my-7 flex items-center justify-center h-20 w-20">
                    <img
                      src="/feature-icon3.png"
                      alt="Pantau Analisis Pengeluaran"
                      className="h-[72px] w-auto object-contain transition-transform group-hover:scale-105"
                    />
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    Grafik visual dan breakdown real-time untuk memahami secara presisi ke mana saja uangmu mengalir setiap periodenya.
                  </p>
                </div>

                {/* Card 4 */}
                <div className="atur-feature-card group">
                  <h3 className="font-bold text-slate-900 text-[17px] leading-snug h-12 flex items-center justify-center text-center">
                    Saving Pocket
                  </h3>
                  <div className="my-7 flex items-center justify-center h-20 w-20">
                    <img
                      src="/feature-icon4.png"
                      alt="Saving Pocket"
                      className="h-[72px] w-auto object-contain transition-transform group-hover:scale-105"
                    />
                  </div>
                  <p className="text-[13px] text-slate-600 leading-relaxed">
                    Alokasikan pos tabungan impian seperti dana darurat, laptop baru, atau wisuda tanpa tercampur dengan saldo harian.
                  </p>
                </div>

              </div>
            </section>

            {/* SECTION: TENTANG KAMI */}
            <section id="about" className="py-14 md:py-20">
              <div className="text-center">
                <p className="text-[13px] md:text-[14px] font-bold tracking-wider text-blue-600 uppercase">
                  TENTANG KAMI
                </p>
                <h2 className="mt-3 text-2xl md:text-[34px] font-extrabold text-slate-900 tracking-tight leading-snug">
                  Membantu Mahasiswa Menggapai
                  <br />
                  Kemandirian Finansial
                </h2>
              </div>

              {/* Banner Card - 1320px Width */}
              <div className="atur-about-box mt-12">
                <p className="text-[15px] md:text-[16px] text-slate-700 leading-[1.8] text-justify">
                  <img
                    src="/logo-atur.png"
                    alt="Logo ATUR"
                    className="h-7 w-auto inline-block -mt-1 mr-2 align-middle"
                  />
                  adalah platform pengelolaan keuangan pribadi yang dirancang khusus untuk membantu mahasiswa membangun kebiasaan finansial yang lebih bijak dan teratur. Melalui fitur pencatatan pemasukan dan pengeluaran, perencanaan anggaran, analisis keuangan, serta Saving Pocket, ATUR memudahkan mahasiswa memahami ke mana uang mereka digunakan dan merencanakan tujuan menabung. Kami percaya bahwa mengelola keuangan tidak harus rumit. Bersama ATUR, setiap langkah kecil dalam mengatur uang menjadi awal menuju kebiasaan finansial yang lebih sehat, sadar, dan bertanggung jawab.
                </p>
              </div>
            </section>

          </main>

          {/* FOOTER */}
          <footer className="mt-20 border-t border-slate-200/70 bg-transparent">
            <div className="atur-container py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              {/* Left: Logo & Tagline */}
              <div>
                <img src="/logo-atur.png" alt="ATUR" className="h-8 w-auto object-contain" />
                <p className="mt-3 text-[13.5px] text-slate-500 max-w-sm leading-relaxed">
                  Platform manajemen keuangan cerdas untuk mahasiswa. Atur uang saku, pantau pengeluaran, dan wujudkan tabungan mandiri.
                </p>
              </div>

              {/* Right: Navigation Links */}
              <div className="flex items-center gap-10 text-[15px] font-medium text-slate-600">
                <a href="#home" className="hover:text-blue-600 transition-colors">
                  Home
                </a>
                <a href="#fitur" className="hover:text-blue-600 transition-colors">
                  Fitur
                </a>
                <a href="#about" className="hover:text-blue-600 transition-colors">
                  About Us
                </a>
              </div>
            </div>
          </footer>

        </div>
      )}


      {/* ========================================================================= */}
      {/* 2. LOGIN VIEW (100% Matching Login__1__365fd5b7.png)                      */}
      {/* Jarak dekat presisi 60px antara Card Box dan Kolom Kanan                 */}
      {/* ========================================================================= */}
      {currentView === 'login' && (
        <div className="bg-auth-canvas min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
          
          {/* atur-auth-wrapper: menggunakan gap 60px persis sesuai pengukuran desain UI */}
          <div className="atur-auth-wrapper">
            
            {/* LEFT COLUMN: Exactly 668px Card Box matching reference Login__1__365fd5b7.png */}
            <div className="atur-auth-card atur-auth-card-login">
              
              {/* Header */}
              <h1 className="text-[28px] sm:text-[32px] font-bold text-slate-900 tracking-tight">
                Selamat Datang di{' '}
                <button
                  type="button"
                  onClick={() => switchView('landing')}
                  title="Kembali ke Beranda"
                  className="text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  ATUR
                </button>
              </h1>
              <p className="text-[14px] sm:text-[15px] text-slate-600 mt-2 mb-8">
                Masuk untuk melanjutkan mengatur pos keuanganmu.
              </p>

              {/* Form Fields - centered 447px */}
              <form onSubmit={handleLoginSubmit} noValidate className="space-y-4">
                {loginError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[13.5px] font-medium text-red-700"
                  >
                    {loginError}
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label htmlFor="login-email" className="atur-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="login-email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (loginError) setLoginError(null);
                    }}
                    placeholder="Example@email.com"
                    required
                    className="atur-input"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="login-password" className="atur-label">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      id="login-password"
                      value={loginPassword}
                      onChange={(e) => {
                        setLoginPassword(e.target.value);
                        if (loginError) setLoginError(null);
                      }}
                      placeholder="Minimal 8 karakter"
                      required
                      className="atur-input pl-4 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title={showLoginPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showLoginPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Options: Remember me & Lupa Password */}
                <div className="flex items-center justify-between text-[14px] pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={loginRememberMe}
                      onChange={(e) => setLoginRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => showToast('Instruksi pemulihan kata sandi telah dikirim ke email.')}
                    className="text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                  >
                    Lupa Password?
                  </button>
                </div>

                {/* Primary Action Button "Masuk" */}
                <button type="submit" className="atur-btn-primary mt-2">
                  Masuk
                </button>

              </form>

              {/* Divider: atau */}
              <div className="atur-divider">
                <div className="atur-divider-line"></div>
                <span className="atur-divider-text">atau</span>
                <div className="atur-divider-line"></div>
              </div>

              {/* Social Login Buttons (3-Column Icon Grid) */}
              <div className="atur-social-grid">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleSocialAuth('Google', 'login')}
                  aria-label="Masuk dengan Google"
                  title="Masuk dengan Google"
                  className="atur-social-btn atur-social-google"
                >
                  <svg className="w-[22px] h-[22px] flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => handleSocialAuth('Facebook', 'login')}
                  aria-label="Masuk dengan Facebook"
                  title="Masuk dengan Facebook"
                  className="atur-social-btn atur-social-facebook"
                >
                  <svg className="w-[22px] h-[22px] fill-current flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>

                {/* Apple */}
                <button
                  type="button"
                  onClick={() => handleSocialAuth('Apple', 'login')}
                  aria-label="Masuk dengan Apple"
                  title="Masuk dengan Apple"
                  className="atur-social-btn atur-social-apple"
                >
                  <svg className="w-[22px] h-[22px] fill-current flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.78 1.06-1.85.94-2.94-1 .04-2.15.65-2.82 1.43-.59.68-1.11 1.77-.97 2.83 1.11.08 2.22-.54 2.85-1.32z"/>
                  </svg>
                </button>
              </div>

              {/* Footer Link inside the card */}
              <p className="text-center text-[14px] text-slate-600 mt-7">
                Belum punya akun?{' '}
                <button
                  type="button"
                  onClick={() => switchView('register')}
                  className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  Daftar
                </button>
              </p>

            </div>

            {/* RIGHT COLUMN: Typography & Isometric Graphic (2-line heading, exact 60px gap) */}
            <div className="atur-auth-right">
              <h2 className="atur-auth-heading">
                Atur Keuangan Kuliahmu,
                <br />
                <span className="lg:whitespace-nowrap">Capai Impian Tanpa Cemas.</span>
              </h2>
              <p className="atur-auth-desc">
                Platform pencatatan mandiri khusus mahasiswa. Pantau saldo siap belanja, amankan budget bulanan, dan kelola pos Saving Pocket tanpa ribet.
              </p>

              {/* Isometric Visual */}
              <div className="mt-8 flex justify-center items-center">
                <img
                  src="/illustration-isometric-trans.png"
                  alt="Ilustrasi Isometric ATUR"
                  className="w-full max-w-[540px] h-auto object-contain select-none pointer-events-none drop-shadow-sm"
                />
              </div>
            </div>

          </div>

        </div>
      )}


      {/* ========================================================================= */}
      {/* 3. REGISTER VIEW (100% Matching Register__1__9f191f2b.png)                */}
      {/* Jarak dekat presisi 60px antara Card Box dan Kolom Kanan                 */}
      {/* ========================================================================= */}
      {currentView === 'register' && (
        <div className="bg-auth-canvas min-h-screen flex items-center justify-center p-4 sm:p-6 lg:p-8 xl:p-12">
          
          {/* atur-auth-wrapper: menggunakan gap 60px persis sesuai pengukuran desain UI */}
          <div className="atur-auth-wrapper">
            
            {/* LEFT COLUMN: Exactly 668px Card Box matching reference Register__1__9f191f2b.png */}
            <div className="atur-auth-card atur-auth-card-register">
              
              {/* Header */}
              <h1 className="text-[28px] sm:text-[32px] font-bold text-slate-900 tracking-tight">
                Selamat Datang di{' '}
                <button
                  type="button"
                  onClick={() => switchView('landing')}
                  title="Kembali ke Beranda"
                  className="text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  ATUR
                </button>
              </h1>
              <p className="text-[14px] sm:text-[15px] text-slate-600 mt-2 mb-6 leading-snug">
                Buat akun ATUR untuk bangun kebiasaan finansial yang lebih teratur.
              </p>

              {/* Form Fields - centered 447px */}
              <form onSubmit={handleRegisterSubmit} noValidate className="space-y-3.5">
                {registerError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-[13px] font-medium text-red-700"
                  >
                    {registerError}
                  </div>
                )}

                {/* Nama Lengkap */}
                <div>
                  <label htmlFor="reg-name" className="atur-label">
                    Nama lengkap
                  </label>
                  <input
                    type="text"
                    id="reg-name"
                    value={regName}
                    onChange={(e) => {
                      setRegName(e.target.value);
                      if (registerError) setRegisterError(null);
                    }}
                    placeholder="Masukkan nama lengkap"
                    required
                    className="atur-input atur-input-compact"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="reg-email" className="atur-label">
                    Email
                  </label>
                  <input
                    type="email"
                    id="reg-email"
                    value={regEmail}
                    onChange={(e) => {
                      setRegEmail(e.target.value);
                      if (registerError) setRegisterError(null);
                    }}
                    placeholder="Example@email.com"
                    required
                    className="atur-input atur-input-compact"
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="reg-password" className="atur-label">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showRegPassword ? 'text' : 'password'}
                      id="reg-password"
                      value={regPassword}
                      onChange={(e) => {
                        setRegPassword(e.target.value);
                        if (registerError) setRegisterError(null);
                      }}
                      placeholder="Minimal 8 karakter"
                      required
                      minLength={8}
                      className="atur-input atur-input-compact pl-4 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegPassword(!showRegPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title={showRegPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showRegPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Konfirmasi Password */}
                <div>
                  <label htmlFor="reg-confirm-password" className="atur-label">
                    Konfirmasi Password
                  </label>
                  <div className="relative">
                    <input
                      type={showRegConfirmPassword ? 'text' : 'password'}
                      id="reg-confirm-password"
                      value={regConfirmPassword}
                      onChange={(e) => {
                        setRegConfirmPassword(e.target.value);
                        if (registerError) setRegisterError(null);
                      }}
                      placeholder="Ulangi password"
                      required
                      minLength={8}
                      className="atur-input atur-input-compact pl-4 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                      title={showRegConfirmPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                    >
                      {showRegConfirmPassword ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {/* Options: Remember me (Lupa Password removed on Register page) */}
                <div className="flex items-center text-[14px] pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={regRememberMe}
                      onChange={(e) => setRegRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Remember me</span>
                  </label>
                </div>

                {/* Primary Action Button - says "Masuk" matching design */}
                <button type="submit" className="atur-btn-primary atur-btn-primary-compact mt-2">
                  Masuk
                </button>

              </form>

              {/* Divider: atau */}
              <div className="atur-divider">
                <div className="atur-divider-line"></div>
                <span className="atur-divider-text">atau</span>
                <div className="atur-divider-line"></div>
              </div>

              {/* Social Login Buttons (3-Column Icon Grid) */}
              <div className="atur-social-grid">
                {/* Google */}
                <button
                  type="button"
                  onClick={() => handleSocialAuth('Google', 'register')}
                  aria-label="Daftar dengan Google"
                  title="Daftar dengan Google"
                  className="atur-social-btn atur-social-google"
                >
                  <svg className="w-[22px] h-[22px] flex-shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                </button>

                {/* Facebook */}
                <button
                  type="button"
                  onClick={() => handleSocialAuth('Facebook', 'register')}
                  aria-label="Daftar dengan Facebook"
                  title="Daftar dengan Facebook"
                  className="atur-social-btn atur-social-facebook"
                >
                  <svg className="w-[22px] h-[22px] fill-current flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </button>

                {/* Apple */}
                <button
                  type="button"
                  onClick={() => handleSocialAuth('Apple', 'register')}
                  aria-label="Daftar dengan Apple"
                  title="Daftar dengan Apple"
                  className="atur-social-btn atur-social-apple"
                >
                  <svg className="w-[22px] h-[22px] fill-current flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.37c.63-.78 1.06-1.85.94-2.94-1 .04-2.15.65-2.82 1.43-.59.68-1.11 1.77-.97 2.83 1.11.08 2.22-.54 2.85-1.32z"/>
                  </svg>
                </button>
              </div>

              {/* Footer Link inside card */}
              <p className="text-center text-[14px] text-slate-600 mt-6">
                Sudah Punya Akun?{' '}
                <button
                  type="button"
                  onClick={() => switchView('login')}
                  className="text-blue-600 hover:text-blue-700 font-semibold cursor-pointer"
                >
                  Masuk
                </button>
              </p>

            </div>

            {/* RIGHT COLUMN: Typography & Isometric Graphic (2-line heading, exact 60px gap) */}
            <div className="atur-auth-right">
              <h2 className="atur-auth-heading">
                Atur Keuangan Kuliahmu,
                <br />
                <span className="lg:whitespace-nowrap">Capai Impian Tanpa Cemas.</span>
              </h2>
              <p className="atur-auth-desc">
                Platform pencatatan mandiri khusus mahasiswa. Pantau saldo siap belanja, amankan budget bulanan, dan kelola pos Saving Pocket tanpa ribet.
              </p>

              {/* Isometric Visual */}
              <div className="mt-8 flex justify-center items-center">
                <img
                  src="/illustration-isometric-trans.png"
                  alt="Ilustrasi Isometric ATUR"
                  className="w-full max-w-[540px] h-auto object-contain select-none pointer-events-none drop-shadow-sm"
                />
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. DASHBOARD VIEW (100% Matching Dashboard_cd052ab8.png & Modals)         */}
      {/* ========================================================================= */}
      {currentView === 'dashboard' && currentUser && (
        <Dashboard
          userName={currentUser.name.split(' ')[0] || 'Nadia'}
          onLogout={() => {
            setCurrentUser(null);
            switchView('landing');
          }}
        />
      )}

    </div>
  );
}
