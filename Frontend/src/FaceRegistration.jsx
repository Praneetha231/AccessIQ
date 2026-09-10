// frontend/src/FaceRegistration.jsx
import { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import API from './services/api';

export default function FaceRegistration({ userEmail, onComplete }) {
  const webcamRef = useRef(null);
  const [imgSrc, setImgSrc] = useState(null);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setImgSrc(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setImgSrc(null);
    setStatus('');
  };

  const submitFace = async () => {
    if (!imgSrc) return;
    setLoading(true);
    setStatus('');

    try {
      const res = await API.post('/api/v1/face/register', {
        email: userEmail,
        image_data: imgSrc,
      });
      setStatus(res.data.message);
      if (onComplete) onComplete();
    } catch (err) {
      setStatus(err.response?.data?.detail || 'Failed to register face.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '2rem auto', textAlign: 'center', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Face Registration</h2>
      <p style={{ color: '#666' }}>Align your face inside the camera frame.</p>

      {status && <p style={{ color: status.includes('success') ? 'green' : 'red', fontWeight: 'bold' }}>{status}</p>}

      <div style={{ margin: '1rem 0', position: 'relative', display: 'inline-block' }}>
        {!imgSrc ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            width={400}
            height={300}
            videoConstraints={{ facingMode: 'user' }}
            style={{ borderRadius: '8px', border: '2px solid #0070f3' }}
          />
        ) : (
          <img src={imgSrc} alt="Captured face" style={{ width: 400, height: 300, borderRadius: '8px' }} />
        )}
      </div>

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        {!imgSrc ? (
          <button onClick={capture} style={{ padding: '10px 20px', background: '#0070f3', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            Capture Photo
          </button>
        ) : (
          <>
            <button onClick={retake} disabled={loading} style={{ padding: '10px 20px', background: '#666', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              Retake
            </button>
            <button onClick={submitFace} disabled={loading} style={{ padding: '10px 20px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
              {loading ? 'Submitting...' : 'Confirm & Register'}
            </button>
          </>
        )}
      </div>
    </div>
  );
}