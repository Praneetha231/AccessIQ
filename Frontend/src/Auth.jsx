// frontend/src/Auth.jsx
import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import API from './services/api';

export default function Auth({ onLoginSuccess }) {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState('');
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
        if (onLoginSuccess) onLoginSuccess(res.data.email);
      } else {
        const res = await API.post('/api/v1/auth/register', {
          email: email,
          image_data: imgSrc
        });
        setMessage(res.data.message);
        if (onLoginSuccess) onLoginSuccess(res.data.email);
      }
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.detail || 'Face verification failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto my-10 p-6 bg-white border border-gray-200 rounded-2xl shadow-xl font-sans">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {isLogin ? 'Biometric Face Login' : 'Register Account'}
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          {isLogin ? 'Look directly into the camera to log in.' : 'Enter your email address and capture your face snapshot.'}
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
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Email Address
            </label>
            <input 
              type="email" 
              required 
              placeholder="name@example.com"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition"
            />
          </div>
        )}

        {/* Camera Display Box */}
        <div className="relative flex justify-center items-center my-4 bg-gray-900 rounded-xl overflow-hidden shadow-inner border border-gray-800">
          {!imgSrc ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              width={400}
              height={300}
              videoConstraints={{ facingMode: 'user' }}
              className="w-full h-64 object-cover"
            />
          ) : (
            <img 
              src={imgSrc} 
              alt="Captured Face" 
              className="w-full h-64 object-cover border-2 border-green-500" 
            />
          )}
        </div>

        {/* Liveness Guidance Banner */}
<div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs text-blue-800 text-left flex items-center gap-2">
  <span className="text-base">🛡️</span>
  <span><strong>Liveness Detection Active:</strong> Ensure full lighting and look directly into the camera with open eyes.</span>
</div>

        {/* Action Controls */}
        <div className="flex gap-3 justify-center">
          {!imgSrc ? (
            <button 
              type="button" 
              onClick={capture} 
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition active:scale-95 text-sm"
            >
              📷 Capture Face
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

        {/* Submit Button */}
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

      {/* Mode Switcher */}
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