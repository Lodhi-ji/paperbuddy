import React, { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { Search, Bell, Moon, Sun, User, Lock, KeyRound, Loader2, X, Eye, EyeOff, LogOut } from 'lucide-react';
import { api } from '../api';

export default function Header() {
  const { user, logout } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState(false);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setModalError('');
    setModalSuccess(false);
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setModalError('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setModalError('New password and confirm password do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setModalError('New password must be at least 6 characters long.');
      return;
    }

    setIsModalLoading(true);
    setModalError('');

    try {
      await api.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      setModalSuccess(true);
      setTimeout(() => {
        handleCloseModal();
      }, 2000);
    } catch (err) {
      setModalError(err.message || 'Failed to change password.');
    } finally {
      setIsModalLoading(false);
    }
  };

  return (
    <header className="flex items-center justify-between pt-4 pb-2 mb-4">
      {/* Left: Titles & Greeting */}
      <div>
        <h1 className="text-2xl font-black text-slate-800 tracking-tight leading-none">
          {user?.schoolName || 'Campus Pay Overview'}
        </h1>
        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
          All payments on one Intelligent Platform
        </p>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-4">
        {/* Action Icons */}
        <div className="flex items-center gap-2">
          <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all">
            <Bell className="w-4 h-4" />
          </button>
          <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 hover:text-brand-primary hover:border-brand-primary/30 transition-all">
            <Moon className="w-4 h-4" />
          </button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-slate-200 mx-1" />

        {/* Profile */}
        <div className="flex items-center gap-3 relative" ref={dropdownRef}>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-slate-800">{user?.name}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{user?.role?.replace('_', ' ')}</p>
          </div>
          
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-primary to-brand-accent shadow-md flex items-center justify-center text-white font-bold text-sm transform hover:scale-105 transition-transform relative"
            title="Profile Menu"
          >
            {user?.name ? user.name.slice(0, 2).toUpperCase() : <User className="w-5 h-5" />}
          </button>

          {/* Profile Dropdown Menu */}
          {showDropdown && (
            <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => {
                  setShowDropdown(false);
                  setIsModalOpen(true);
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 hover:text-brand-primary transition-colors text-left"
              >
                <Lock className="w-4 h-4" />
                <span className="font-medium">Change Password</span>
              </button>
              
              <div className="h-px bg-slate-100 my-1 mx-2" />
              
              <button
                onClick={() => {
                  setShowDropdown(false);
                  logout();
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CHANGE PASSWORD MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md no-print">
          <div className="w-full max-w-md bg-white rounded-[24px] p-6 border border-slate-200 shadow-premium overflow-hidden flex flex-col relative text-left">
            <button
              type="button"
              onClick={handleCloseModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-slate-800 mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-primary" />
              Security Settings
            </h3>
            <p className="text-xs text-slate-400 font-medium mb-6">Update your password security credentials.</p>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-brand-danger/10 border border-brand-danger/20 text-brand-danger text-xs font-semibold">
                {modalError}
              </div>
            )}

            {modalSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-brand-success/10 border border-brand-success/20 text-brand-success rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <KeyRound className="w-6 h-6 animate-bounce" />
                </div>
                <p className="text-sm font-black text-brand-success">Password Changed Successfully!</p>
                <p className="text-xs text-slate-400 font-medium">Your password has been securely updated.</p>
              </div>
            ) : (
              <form onSubmit={handleChangePasswordSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
                <div>
                  <label className="block mb-1.5 uppercase tracking-wide">Current Password *</label>
                  <div className="relative">
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 pr-10 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                      disabled={isModalLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 uppercase tracking-wide">New Password *</label>
                  <div className="relative">
                    <input
                      type={showNew ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 pr-10 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                      disabled={isModalLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 uppercase tracking-wide">Confirm New Password *</label>
                  <div className="relative">
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 pr-10 focus:outline-none focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all"
                      disabled={isModalLoading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isModalLoading}
                    className="flex-1 bg-brand-primary hover:bg-brand-secondary text-white rounded-xl flex items-center justify-center gap-2 py-3 font-bold uppercase tracking-wider transition-colors"
                  >
                    {isModalLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl py-3 px-6 font-bold uppercase tracking-wider transition-colors"
                    disabled={isModalLoading}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
