import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { Save, Plus, X, Star, Award } from 'lucide-react';

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
      setSuccess('Profile updated successfully!');
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const addSubject = (subject: string) => {
    if (subject && !formData.subjects.includes(subject)) {
      setFormData({
        ...formData,
        subjects: [...formData.subjects, subject]
      });
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
      setFormData({
        ...formData,
        goals: [...formData.goals, newGoal]
      });
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
      schedule: {
        ...formData.schedule,
        [day]: updatedSlots
      }
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Profile</h1>
        <p className="text-gray-600">Customize your profile to find the perfect study matches</p>
      </div>

      {/* Profile Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-primary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{user?.points || 0}</h3>
          <p className="text-gray-600">Points Earned</p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="h-8 w-8 text-accent-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">Level {user?.level || 1}</h3>
          <p className="text-gray-600">Current Level</p>
        </div>

        <div className="card p-6 text-center">
          <div className="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Award className="h-8 w-8 text-secondary-600" />
          </div>
          <h3 className="text-2xl font-bold text-gray-900">{user?.badges?.length || 0}</h3>
          <p className="text-gray-600">Badges</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Info */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Basic Information</h2>
          
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Subjects */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Study Subjects</h2>
          
          {/* Current Subjects */}
          <div className="flex flex-wrap gap-2 mb-4">
            {formData.subjects.map((subject) => (
              <span
                key={subject}
                className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary-100 text-primary-800"
              >
                {subject}
                <button
                  type="button"
                  onClick={() => removeSubject(subject)}
                  className="ml-2 hover:text-primary-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>

          {/* Add Custom Subject */}
          <div className="flex gap-2 mb-4">
            <input
              type="text"
              placeholder="Add a subject..."
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubject(newSubject))}
            />
            <button
              type="button"
              onClick={() => addSubject(newSubject)}
              className="btn-primary"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          {/* Common Subjects */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {commonSubjects.map((subject) => (
              <button
                key={subject}
                type="button"
                onClick={() => addSubject(subject)}
                disabled={formData.subjects.includes(subject)}
                className={`text-sm py-2 px-3 rounded-lg border transition-colors ${
                  formData.subjects.includes(subject)
                    ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-primary-50 hover:border-primary-300'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Goals */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Learning Goals</h2>
          
          {/* Current Goals */}
          <div className="space-y-2 mb-4">
            {formData.goals.map((goal) => (
              <div
                key={goal}
                className="flex items-center justify-between p-3 bg-accent-50 rounded-lg"
              >
                <span className="text-sm text-gray-700">{goal}</span>
                <button
                  type="button"
                  onClick={() => removeGoal(goal)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Goal */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a learning goal..."
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
            />
            <button
              type="button"
              onClick={addGoal}
              className="btn-primary"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Schedule */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Study Schedule</h2>
          <p className="text-gray-600 mb-6">Select your preferred study times to find compatible study partners</p>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-gray-700 pb-3"></th>
                  {timeSlots.map((slot) => (
                    <th key={slot} className="text-center text-xs font-medium text-gray-700 pb-3 px-2 min-w-0">
                      {slot.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {weekDays.map((day) => (
                  <tr key={day}>
                    <td className="text-sm font-medium text-gray-700 py-2 pr-4">
                      {day}
                    </td>
                    {timeSlots.map((slot) => (
                      <td key={`${day}-${slot}`} className="text-center py-2 px-2">
                        <button
                          type="button"
                          onClick={() => updateSchedule(day, slot)}
                          className={`w-6 h-6 rounded border-2 transition-colors ${
                            formData.schedule[day]?.includes(slot)
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-gray-300 hover:border-primary-300'
                          }`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          {success && (
            <div className="text-accent-600 bg-accent-50 px-4 py-2 rounded-lg">
              {success}
            </div>
          )}
          {error && (
            <div className="text-red-600 bg-red-50 px-4 py-2 rounded-lg">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </div>
            ) : (
              <div className="flex items-center">
                <Save className="h-4 w-4 mr-2" />
                Save Profile
              </div>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Profile;