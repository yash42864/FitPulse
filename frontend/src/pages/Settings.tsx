import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Modal } from '../components/ui/Modal';
import {
  User,
  Lock,
  Trash2,
  Save,
  CheckCircle2,
  AlertTriangle,
  Settings as SettingsIcon,
} from 'lucide-react';

export const Settings: React.FC = () => {
  const { user, updateUser, logout } = useAuth();

  // Profile Form
  const [name, setName] = useState(user?.name || '');
  const [height, setHeight] = useState(user?.height || 175);
  const [currentWeight, setCurrentWeight] = useState(user?.currentWeight || 75);
  const [fitnessGoal, setFitnessGoal] = useState(user?.fitnessGoal || 'general_fitness');
  const [activityLevel, setActivityLevel] = useState(user?.activityLevel || 'moderately_active');
  const [units, setUnits] = useState(user?.preferences?.measurementUnits || 'metric');

  // Password Form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // States
  const [profileSaved, setProfileSaved] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setError(null);
    try {
      const res = await api.patch('/users/profile', {
        name,
        height: Number(height),
        currentWeight: Number(currentWeight),
        fitnessGoal,
        activityLevel,
        preferences: {
          measurementUnits: units,
        },
      });
      if (res.data?.success) {
        updateUser(res.data.profile);
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    setError(null);
    try {
      await api.post('/users/change-password', {
        currentPassword,
        newPassword,
      });
      setPasswordSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/users/account');
      await logout();
      window.location.href = '/login';
    } catch (err) {
      console.error('Failed to delete account:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          User Settings & Preferences
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Manage your personal biometric parameters, credentials, and data privacy
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm flex items-center gap-2">
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#273349] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-lime-accent/15 border border-lime-accent/30 flex items-center justify-center text-lime-accent">
              <User size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Biometric Profile</h3>
              <span className="text-xs text-gray-400">Account Email: {user?.email}</span>
            </div>
          </div>
          {profileSaved && (
            <Badge variant="lime" className="flex items-center gap-1">
              <CheckCircle2 size={13} /> Saved
            </Badge>
          )}
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#151B2B] border border-[#273349] focus:border-lime-accent rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Units of Measure
              </label>
              <select
                value={units}
                onChange={(e) => setUnits(e.target.value as any)}
                className="w-full bg-[#151B2B] border border-[#273349] focus:border-lime-accent rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              >
                <option value="metric">Metric (kg, cm, ml)</option>
                <option value="imperial">Imperial (lbs, in, oz)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                className="w-full bg-[#151B2B] border border-[#273349] focus:border-lime-accent rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(Number(e.target.value))}
                className="w-full bg-[#151B2B] border border-[#273349] focus:border-lime-accent rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Fitness Goal
              </label>
              <select
                value={fitnessGoal}
                onChange={(e) => setFitnessGoal(e.target.value as any)}
                className="w-full bg-[#151B2B] border border-[#273349] focus:border-lime-accent rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              >
                <option value="muscle_gain">Muscle Gain</option>
                <option value="fat_loss">Fat Loss</option>
                <option value="weight_maintenance">Weight Maintenance</option>
                <option value="general_fitness">General Fitness</option>
                <option value="improved_endurance">Improved Endurance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as any)}
                className="w-full bg-[#151B2B] border border-[#273349] focus:border-lime-accent rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              >
                <option value="sedentary">Sedentary</option>
                <option value="lightly_active">Lightly Active</option>
                <option value="moderately_active">Moderately Active</option>
                <option value="very_active">Very Active</option>
                <option value="extra_active">Extra Active</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="primary" isLoading={savingProfile}>
              <Save size={16} /> Save Changes
            </Button>
          </div>
        </form>
      </Card>

      {/* Change Password Card */}
      <Card className="p-6">
        <div className="flex items-center justify-between pb-4 border-b border-[#273349] mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-accent/15 border border-violet-accent/30 flex items-center justify-center text-violet-300">
              <Lock size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Security & Password</h3>
              <span className="text-xs text-gray-400">Update your account authentication credentials</span>
            </div>
          </div>
          {passwordSaved && (
            <Badge variant="lime" className="flex items-center gap-1">
              <CheckCircle2 size={13} /> Updated
            </Badge>
          )}
        </div>

        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full bg-[#151B2B] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#151B2B] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#151B2B] border border-[#273349] rounded-xl px-4 py-2 text-sm text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <Button type="submit" variant="secondary" isLoading={savingPassword}>
              Update Password
            </Button>
          </div>
        </form>
      </Card>

      {/* Danger Zone: Account Deletion */}
      <Card className="p-6 border-red-500/20 bg-red-500/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-red-400 flex items-center gap-2">
              <Trash2 size={18} /> Danger Zone: Delete Account
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Permanently cascades and deletes your user profile and all 10 MongoDB health collections.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Confirm Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Account Deletion"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-300">
            This action is <span className="text-red-400 font-bold">permanent and irreversible</span>. All your activity logs, meals, workouts, sleep entries, and body measurements will be immediately deleted from the database.
          </p>
          <div className="flex justify-end gap-3 pt-3">
            <Button variant="outline" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAccount}>
              Permanently Delete Everything
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
