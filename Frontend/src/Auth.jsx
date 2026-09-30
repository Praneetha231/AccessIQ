// frontend/src/Auth.jsx
import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import API from './services/api';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(false);
  
  // New registration fields state
  const [fullName, setFullName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('');

  const [message, setMessage] = useState('');
  const [imgSrc, setImgSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    const image = webcamRef.current?.getScreenshot();
    if (image) setImgSrc(image);
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
    setMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isLogin) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setMessage('Please enter a valid email address.');
        return;
      }
      if (!fullName || !mobile || !dob) {
        setMessage('Please fill in all personal details.');
        return;
      }
    }

    if (!imgSrc) {
      setMessage('Please capture your face photo first.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      if (isLogin) {
        const res = await API.post('/api/v1/auth/login', {
          image_data: imgSrc
        });
        setMessage(res.data.message);
        
        // Save session email for the dashboard
        localStorage.setItem('userEmail', res.data.email);

        if (onLoginSuccess) onLoginSuccess(res.data.email);
      } else {
        const res = await API.post('/api/v1/auth/register', {
          full_name: fullName,
          mobile: mobile,
          email: email,
          gender: gender,
          dob: dob,
          image_data: imgSrc
        });
        setMessage(res.data.message);
        
        // Save session email for the dashboard
        localStorage.setItem('userEmail', res.data.email);

        if (onLoginSuccess) onLoginSuccess(res.data.email);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.detail || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto my-10 p-6 bg-white border border-gray-200 rounded-2xl shadow-xl font-sans">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isLogin ? 'Biometric Face Login' : 'Create Access IQ Account'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isLogin ? 'Look directly into the camera to log in.' : 'Fill in your personal profile information and capture your face.'}
        </p>
      </div>

      {message && (
        <div className={`p-3 mb-4 rounded-lg text-sm text-center font-medium ${
          message.toLowerCase().includes('success') 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
            <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Personal Information</h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                placeholder="John Doe"
                value={fullName} 
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required 
                  placeholder="name@example.com"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Mobile Number</label>
                <input 
                  type="tel" 
                  required 
                  placeholder="+91 9876543210"
                  value={mobile} 
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Gender</label>
                <select 
                  value={gender} 
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Date of Birth</label>
                <input 
                  type="date" 
                  required 
                  value={dob} 
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
            Biometric Face Capture
          </label>
          <div className="relative flex justify-center items-center bg-gray-900 rounded-xl overflow-hidden shadow-inner border border-gray-800">
            {!imgSrc ? (
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                width={400}
                height={300}
                videoConstraints={{ facingMode: 'user' }}
                className="w-full h-56 object-cover"
              />
            ) : (
              <img 
                src={imgSrc} 
                alt="Captured Face" 
                className="w-full h-56 object-cover border-2 border-green-500" 
              />
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          {!imgSrc ? (
            <button 
              type="button" 
              onClick={capture} 
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition active:scale-95 text-sm"
            >
              📷 Capture Face Snapshot
            </button>
          ) : (
            <button 
              type="button" 
              onClick={retake} 
              className="w-full py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-md transition active:scale-95 text-sm"
            >
              🔄 Retake Photo
            </button>
          )}
        </div>

        <button 
          type="submit" 
          disabled={loading || !imgSrc} 
          className={`w-full py-3 font-bold text-white text-sm rounded-lg shadow-md transition ${
            loading || !imgSrc 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-green-600 hover:bg-green-700 active:scale-95'
          }`}
        >
          {loading ? 'Processing...' : isLogin ? 'Verify & Log In' : 'Complete Registration'}
        </button>
      </form>

      <div className="text-center mt-6 pt-4 border-t border-gray-100">
        <button 
          type="button"
          className="text-sm font-medium text-blue-600 hover:text-blue-800 transition underline"
          onClick={() => { setIsLogin(!isLogin); setImgSrc(null); setMessage(''); }}
        >
          {isLogin ? "Need an account? Switch to Registration" : 'Already registered? Switch to Face Login'}
        </button>
      </div>
    </div>
  );
}