import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Save, Plus, X, Star, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    subjects: user?.subjects || [],
    goals: user?.goals || [],
    schedule: user?.schedule || {}
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const commonSubjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science',
    'Psychology', 'Economics', 'History', 'Literature', 'Philosophy'
  ];

  const timeSlots = [
    'Early Morning (6-9 AM)', 'Morning (9-12 PM)', 'Afternoon (12-5 PM)', 
    'Evening (5-8 PM)', 'Night (8-11 PM)', 'Late Night (11 PM-2 AM)'
  ];

  const weekDays = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await axios.put('/api/profile', formData, { withCredentials: true });
      updateUser(response.data);
      setSuccess('✅ Profile updated successfully!');
    } catch (error: any) {
      setError(error.response?.data?.message || '❌ Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSubject = (subject: string) => {
    if (subject && !formData.subjects.includes(subject)) {
      setFormData({ ...formData, subjects: [...formData.subjects, subject] });
    }
    setNewSubject('');
  };

  const removeSubject = (subject: string) => {
    setFormData({
      ...formData,
      subjects: formData.subjects.filter(s => s !== subject)
    });
  };

  const addGoal = () => {
    if (newGoal && !formData.goals.includes(newGoal)) {
      setFormData({ ...formData, goals: [...formData.goals, newGoal] });
    }
    setNewGoal('');
  };

  const removeGoal = (goal: string) => {
    setFormData({
      ...formData,
      goals: formData.goals.filter(g => g !== goal)
    });
  };

  const updateSchedule = (day: string, timeSlot: string) => {
    const currentSlots = formData.schedule[day] || [];
    const updatedSlots = currentSlots.includes(timeSlot)
      ? currentSlots.filter(slot => slot !== timeSlot)
      : [...currentSlots, timeSlot];
    setFormData({
      ...formData,
      schedule: { ...formData.schedule, [day]: updatedSlots }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#0f172a] text-white px-4 md:px-8 py-10 relative overflow-hidden">
      {/* background glow */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full animate-pulse-slow"></div>
      </div>

      {/* heading */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 mb-10 text-center"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-2">Your Profile</h1>
        <p className="text-white/70 text-base md:text-lg">Customize your profile to get the best study matches ✨</p>
      </motion.div>

      {/* stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10"
      >
        {[
          { label: 'Points Earned', icon: <Star className="h-7 w-7" />, value: user?.points || 0, color: 'from-yellow-500 to-amber-400' },
          { label: 'Current Level', icon: <Award className="h-7 w-7" />, value: `Level ${user?.level || 1}`, color: 'from-blue-500 to-indigo-500' },
          { label: 'Badges', icon: <Award className="h-7 w-7" />, value: user?.badges?.length || 0, color: 'from-purple-500 to-pink-500' },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ scale: 1.05 }}
            className={`rounded-2xl p-6 text-center bg-white/10 backdrop-blur-lg border border-white/10 shadow-lg`}
          >
            <div className={`mx-auto mb-3 w-14 h-14 rounded-full bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-md`}>
              {stat.icon}
            </div>
            <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
            <p className="text-white/60 text-sm">{stat.label}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* form */}
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-10 relative z-10 max-w-5xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        {/* basic info */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-6">Basic Information</h2>
          <label className="block text-white/80 text-sm mb-2 font-medium">Full Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          />
        </div>

        {/* subjects */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-6">Study Subjects</h2>

          <div className="flex flex-wrap gap-2 mb-4">
            {formData.subjects.map((subject) => (
              <span key={subject} className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full flex items-center text-sm">
                {subject}
                <button type="button" onClick={() => removeSubject(subject)} className="ml-2 text-blue-300 hover:text-red-400">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a subject..."
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject(newSubject))}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button type="button" onClick={() => addSubject(newSubject)} className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-500 transition">
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
            {commonSubjects.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => addSubject(subject)}
                disabled={formData.subjects.includes(subject)}
                className={`py-2 px-3 text-sm rounded-lg border transition ${
                  formData.subjects.includes(subject)
                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                    : 'bg-white/5 hover:bg-blue-500/20 hover:text-blue-300 border-white/10 text-white/80'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* goals */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl">
          <h2 className="text-2xl font-semibold mb-6">Learning Goals</h2>
          <div className="space-y-2 mb-4">
            {formData.goals.map((goal) => (
              <div key={goal} className="flex justify-between items-center bg-blue-500/10 rounded-xl px-4 py-2">
                <span className="text-sm">{goal}</span>
                <button onClick={() => removeGoal(goal)} type="button" className="text-white/50 hover:text-red-400 transition">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a learning goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
              className="flex-1 bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white placeholder-white/40 focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button type="button" onClick={addGoal} className="px-4 py-2 bg-blue-600 rounded-xl hover:bg-blue-500 transition">
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* schedule */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 rounded-2xl shadow-xl overflow-x-auto">
          <h2 className="text-2xl font-semibold mb-6">Study Schedule</h2>
          <p className="text-white/70 mb-4 text-sm">Select preferred time slots for studying to match with peers</p>

          <table className="w-full text-sm">
            <thead>
              <tr>
                <th></th>
                {timeSlots.map((slot) => (
                  <th key={slot} className="px-2 py-2 text-center text-xs text-white/70">
                    {slot.split(' ')[0]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {weekDays.map((day) => (
                <tr key={day}>
                  <td className="py-2 pr-4 text-white/80 font-medium">{day}</td>
                  {timeSlots.map((slot) => (
                    <td key={`${day}-${slot}`} className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => updateSchedule(day, slot)}
                        className={`w-6 h-6 rounded-md border transition-colors ${
                          formData.schedule[day]?.includes(slot)
                            ? 'bg-blue-500 border-blue-400'
                            : 'border-white/20 hover:border-blue-400'
                        }`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* footer buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-3">
          {success && <div className="text-green-400 bg-green-500/10 px-4 py-2 rounded-xl">{success}</div>}
          {error && <div className="text-red-400 bg-red-500/10 px-4 py-2 rounded-xl">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl font-semibold text-white hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 border-2 border-t-transparent border-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5" /> Save Profile
              </>
            )}
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default Profile;
