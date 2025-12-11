import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Save, Plus, X, Star, Award, CheckCircle, AlertCircle } from 'lucide-react';

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
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Manage your account and preferences</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { 
              label: 'Total Points', 
              value: user?.points || 0, 
              icon: Star,
              color: 'text-amber-600',
              bgColor: 'bg-amber-50'
            },
            { 
              label: 'Current Level', 
              value: `Level ${user?.level || 1}`,
              icon: Award,
              color: 'text-slate-600',
              bgColor: 'bg-slate-50'
            },
            { 
              label: 'Badges Earned', 
              value: user?.badges?.length || 0,
              icon: Award,
              color: 'text-blue-600',
              bgColor: 'bg-blue-50'
            }
          ].map((stat, idx) => (
            <div key={idx} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-semibold text-gray-900 mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Alert Messages */}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-900">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Study Subjects */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Study Subjects</h2>
            
            {/* Selected Subjects */}
            {formData.subjects.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {formData.subjects.map((subject) => (
                  <span 
                    key={subject} 
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium"
                  >
                    {subject}
                    <button 
                      type="button" 
                      onClick={() => removeSubject(subject)} 
                      className="text-slate-500 hover:text-red-600 transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Add Custom Subject */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="Add a custom subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addSubject(newSubject);
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
              />
              <button 
                type="button" 
                onClick={() => addSubject(newSubject)} 
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Common Subjects */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {commonSubjects.map((subject) => (
                <button
                  key={subject}
                  type="button"
                  onClick={() => addSubject(subject)}
                  disabled={formData.subjects.includes(subject)}
                  className={`py-2 px-3 text-sm rounded-lg border transition-colors ${
                    formData.subjects.includes(subject)
                      ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-slate-50 hover:border-slate-900'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {/* Learning Goals */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Learning Goals</h2>
            
            {formData.goals.length > 0 && (
              <div className="space-y-2 mb-4">
                {formData.goals.map((goal) => (
                  <div 
                    key={goal} 
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-900">{goal}</span>
                    <button 
                      onClick={() => removeGoal(goal)} 
                      type="button" 
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add a learning goal"
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addGoal();
                  }
                }}
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent text-sm"
              />
              <button 
                type="button" 
                onClick={addGoal} 
                className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Study Schedule */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 overflow-x-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Study Schedule</h2>
            <p className="text-sm text-gray-600 mb-4">
              Select your preferred study times to match with peers
            </p>

            <div className="min-w-max">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 pr-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Day
                    </th>
                    {timeSlots.map((slot) => (
                      <th 
                        key={slot} 
                        className="pb-3 px-2 text-center text-xs font-medium text-gray-600"
                      >
                        <div className="whitespace-nowrap">{slot.split(' ')[0]}</div>
                        <div className="text-[10px] text-gray-500 font-normal mt-0.5">
                          {slot.match(/\((.*?)\)/)?.[1]}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {weekDays.map((day, dayIdx) => (
                    <tr key={day} className={dayIdx !== weekDays.length - 1 ? 'border-b border-gray-100' : ''}>
                      <td className="py-3 pr-4 text-gray-700 font-medium">
                        {day}
                      </td>
                      {timeSlots.map((slot) => (
                        <td key={`${day}-${slot}`} className="py-3 px-2 text-center">
                          <button
                            type="button"
                            onClick={() => updateSchedule(day, slot)}
                            className={`w-8 h-8 rounded-lg border-2 transition-all ${
                              formData.schedule[day]?.includes(slot)
                                ? 'bg-slate-900 border-slate-900'
                                : 'border-gray-300 hover:border-slate-900'
                            }`}
                          >
                            {formData.schedule[day]?.includes(slot) && (
                              <CheckCircle className="h-5 w-5 text-white mx-auto" />
                            )}
                          </button>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 border-2 border-t-transparent border-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Profile