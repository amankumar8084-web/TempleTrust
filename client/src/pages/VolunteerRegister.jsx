import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { ShieldCheck, Heart, Award } from 'lucide-react';
import api from '../services/api.js';

const SKILLS_LIST = ['Management', 'Cooking', 'IT & Media', 'First Aid / Medical', 'Event Decoration', 'Security / Crowd Control'];
const AVAILABILITY_LIST = ['Weekends', 'Morning Aarti (5 AM - 8 AM)', 'Evening Aarti (6 PM - 9 PM)', 'Festivals & Special Events', 'Emergency Calls'];

const VolunteerRegister = () => {
  const { user } = useSelector((state) => state.auth);

  const [skills, setSkills] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const res = await api.get('/volunteers/profile');
      setProfile(res.data.data);
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleCheckboxChange = (val, list, setList) => {
    if (list.includes(val)) {
      setList(list.filter(item => item !== val));
    } else {
      setList([...list, val]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please log in first to apply.");
      return;
    }

    setLoading(true);
    setMsg('');
    setErrorMsg('');
    try {
      const res = await api.post('/volunteers/register', { skills, availability });
      setMsg(res.data.message);
      fetchProfile();
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error sending registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-spiritual">
      
      {profile ? (
        <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800/80 p-8 rounded-3xl text-center max-w-lg mx-auto shadow-xl space-y-6">
          <ShieldCheck className="h-16 w-16 text-saffron-600 mx-auto" />
          <h2 className="text-2xl font-extrabold text-gray-800 dark:text-white">Volunteer Status Profile</h2>
          
          <div className="bg-amber-50 dark:bg-slate-800 p-4 rounded-2xl text-xs text-left space-y-2 text-amber-900 dark:text-amber-300">
            <div><strong>Application Status:</strong> <span className="uppercase font-bold text-saffron-700">{profile.status}</span></div>
            <div><strong>Assigned Duties:</strong> {profile.dutiesAssigned?.length || 0} tasks assigned</div>
            <div><strong>Your Registered Skills:</strong> {profile.skills?.join(', ') || 'None'}</div>
          </div>

          <p className="text-xs text-slate-500">
            If your status is pending, our staff is reviewing your application. If approved, you will obtain access to volunteer duty updates.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          
          {/* Info Panels */}
          <div className="space-y-6">
            <span className="text-saffron-600 font-bold tracking-widest text-xs uppercase bg-amber-100 dark:bg-amber-950/40 px-3 py-1.5 rounded-full">
              Community Seva
            </span>
            <h1 className="text-4xl font-extrabold text-maroon-900 dark:text-amber-500">
              Become a Temple Volunteer
            </h1>
            <p className="text-sm text-gray-700 dark:text-slate-300 leading-relaxed text-justify">
              "Manav Seva is Madhav Seva" (Service to Humanity is Service to God). Volunteering is a rewarding way to offer your time and energy to assist in daily temple duties and festivals.
            </p>

            <div className="space-y-4">
              <div className="flex gap-4">
                <Heart className="h-5 w-5 text-saffron-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-white">Daily Annadanam</h4>
                  <p className="text-xs text-gray-500">Help cook and serve free sanctified meals (prasad) to thousands of visiting pilgrims.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Award className="h-5 w-5 text-saffron-600 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm text-gray-800 dark:text-white">Festival Management</h4>
                  <p className="text-xs text-gray-500">Assist in crowd management, decorations, and security during high-crowd celebrations.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-white dark:bg-slate-900 border border-amber-100 dark:border-slate-800/80 p-6 md:p-8 rounded-3xl shadow-xl space-y-6">
            <h3 className="text-xl font-bold text-maroon-900 dark:text-amber-500 border-b border-gray-100 dark:border-slate-800 pb-2">
              Volunteer Application Form
            </h3>

            {msg && <div className="p-3 bg-green-50 text-green-700 text-xs rounded-xl font-bold text-center">{msg}</div>}
            {errorMsg && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl font-bold text-center">{errorMsg}</div>}

            {!user ? (
              <div className="text-center py-10 space-y-3">
                <p className="text-xs text-slate-500">Please log in to submit a volunteer application.</p>
                <a href="/login" className="inline-block bg-saffron-600 text-white font-bold px-6 py-2.5 rounded-xl text-xs">
                  Login / Signup
                </a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* Skills */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Select Your Skills / Interests</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {SKILLS_LIST.map((skill) => (
                      <label key={skill} className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-gray-600 dark:text-slate-400">
                        <input
                          type="checkbox"
                          checked={skills.includes(skill)}
                          onChange={() => handleCheckboxChange(skill, skills, setSkills)}
                          className="rounded text-saffron-600 focus:ring-saffron-500"
                        />
                        <span>{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability */}
                <div className="space-y-2.5">
                  <label className="text-xs font-bold text-gray-700 dark:text-slate-300">Select Availability</label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {AVAILABILITY_LIST.map((avail) => (
                      <label key={avail} className="flex items-center gap-2 text-xs font-semibold cursor-pointer text-gray-600 dark:text-slate-400">
                        <input
                          type="checkbox"
                          checked={availability.includes(avail)}
                          onChange={() => handleCheckboxChange(avail, availability, setAvailability)}
                          className="rounded text-saffron-600 focus:ring-saffron-500"
                        />
                        <span>{avail}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-spiritual-gradient text-white font-bold py-3 rounded-xl shadow-lg hover:scale-102 transition"
                >
                  {loading ? 'Submitting Application...' : 'Submit Application'}
                </button>

              </form>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default VolunteerRegister;
export { VolunteerRegister };
