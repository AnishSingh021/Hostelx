import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, X, RotateCw, Check, Undo2, Grid3X3, Sun, Monitor, AlertTriangle } from 'lucide-react';

export default function CameraCapture({ isOpen, onClose, onCapture }) {
  const [stream, setStream] = useState(null);
  const [permissionState, setPermissionState] = useState('prompt'); // 'prompt', 'loading', 'granted', 'denied'
  const [facingMode, setFacingMode] = useState('environment'); // 'user' (front), 'environment' (back)
  const [aspectRatio, setAspectRatio] = useState('4:3'); // '4:3' or '1:1'
  const [showGrid, setShowGrid] = useState(true);
  const [capturedImage, setCapturedImage] = useState(null); // base64 or blob URL
  const [capturedBlob, setCapturedBlob] = useState(null);
  const [isFlashing, setIsFlashing] = useState(false);
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Synthesize realistic shutter click sound using Web Audio API
  const playShutterSound = () => {
    try {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const bufferSize = ctx.sampleRate * 0.12; // ~120ms
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Generate noise for shutter click
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.setValueAtTime(1500, ctx.currentTime);
      filter.frequency.exponentialRampToValueAtTime(7000, ctx.currentTime + 0.04);
      
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      
      noise.start();
    } catch (e) {
      console.warn('Web Audio synthesis failed or blocked by autoplay policy:', e);
    }
  };

  // Check if multiple cameras are available
  useEffect(() => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;
    navigator.mediaDevices.enumerateDevices()
      .then(devices => {
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setHasMultipleCameras(videoDevices.length > 1);
      })
      .catch(err => console.error('Error enumerating cameras:', err));
  }, []);

  // Request/start camera stream
  const startCamera = async () => {
    // If stream already exists, stop it first
    stopCamera();
    setPermissionState('loading');

    const constraints = {
      video: {
        facingMode: facingMode,
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    };

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      setPermissionState('granted');
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setPermissionState('denied');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  // Start stream when modal is opened
  useEffect(() => {
    if (isOpen) {
      setCapturedImage(null);
      setCapturedBlob(null);
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isOpen, facingMode]);

  // Handle capture action
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Trigger visual flash
    setIsFlashing(true);
    setTimeout(() => setIsFlashing(false), 200);

    // Shutter sound
    playShutterSound();

    // Haptic feedback if available
    if (navigator.vibrate) {
      navigator.vibrate(15);
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Get exact video dimensions
    const videoWidth = video.videoWidth;
    const videoHeight = video.videoHeight;

    if (aspectRatio === '1:1') {
      // Crop to a square in the center
      const size = Math.min(videoWidth, videoHeight);
      const sx = (videoWidth - size) / 2;
      const sy = (videoHeight - size) / 2;

      canvas.width = size;
      canvas.height = size;

      if (facingMode === 'user') {
        // Mirror active front camera capture
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);
    } else {
      // 4:3 or natural video aspect ratio
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      if (facingMode === 'user') {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
      }

      ctx.drawImage(video, 0, 0, videoWidth, videoHeight);
    }

    // Export captured canvas as standard JPEG Blob
    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedBlob(blob);
        const imageUrl = URL.createObjectURL(blob);
        setCapturedImage(imageUrl);
      }
    }, 'image/jpeg', 0.9);
  };

  const handleConfirm = () => {
    if (capturedBlob) {
      // Wrap the JPEG blob inside a Standard JS File object
      const uniqueName = `hostelx_camera_${Date.now()}.jpg`;
      const file = new File([capturedBlob], uniqueName, { type: 'image/jpeg' });
      onCapture(file);
      onClose();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setCapturedBlob(null);
  };

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[9999] flex items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden select-none">
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative bg-zinc-950 sm:border sm:border-zinc-800 text-white w-full max-w-md h-full sm:h-auto sm:max-h-[92vh] sm:rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl justify-between"
        >
          {/* Flash Overlay */}
          <AnimatePresence>
            {isFlashing && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="absolute inset-0 bg-white z-[10000] pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Header Controls */}
          <div className="flex items-center justify-between p-5 bg-gradient-to-b from-black/80 to-transparent z-10">
            <span className="text-sm font-bold tracking-wider uppercase text-zinc-300 flex items-center gap-1.5">
              <Camera className="w-4 h-4 text-primary animate-pulse" />
              Item Lens Capture
            </span>
            <div className="flex items-center gap-2">
              {!capturedImage && (
                <>
                  {/* Grid Lines Toggle */}
                  <button 
                    type="button" 
                    onClick={() => setShowGrid(prev => !prev)}
                    className={`p-2 rounded-xl border transition cursor-pointer ${
                      showGrid ? 'bg-primary/20 border-primary text-primary' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  {/* Aspect Ratio Switch */}
                  <button 
                    type="button"
                    onClick={() => setAspectRatio(prev => prev === '4:3' ? '1:1' : '4:3')}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl text-zinc-300 cursor-pointer"
                  >
                    <span className="opacity-70">Ratio:</span>
                    <span className="text-primary font-bold">{aspectRatio}</span>
                  </button>
                </>
              )}
              {/* Close Button */}
              <button 
                type="button" 
                onClick={onClose}
                className="p-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 rounded-xl transition cursor-pointer text-zinc-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Camera Viewport Canvas/Video */}
          <div className="relative flex-grow flex items-center justify-center bg-black overflow-hidden select-none">
            {permissionState === 'loading' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-zinc-950">
                <div className="w-12 h-12 border-4 border-primary/25 border-t-primary rounded-full animate-spin" />
                <span className="text-xs text-zinc-400 font-semibold tracking-wider">Activating Device Camera...</span>
              </div>
            )}

            {permissionState === 'denied' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-zinc-950/95 space-y-4">
                <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive rounded-full">
                  <AlertTriangle className="w-10 h-10" />
                </div>
                <h3 className="text-lg font-bold">Camera Access Blocked</h3>
                <p className="text-xs text-zinc-400 leading-relaxed max-w-xs">
                  Please enable camera permissions in your web browser settings to snap pictures of your items directly inside HostelX.
                </p>
                <button 
                  type="button" 
                  onClick={startCamera}
                  className="px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:opacity-90 transition cursor-pointer shadow-md"
                >
                  Retry Authorization
                </button>
              </div>
            )}

            {permissionState === 'granted' && (
              <div 
                className="relative overflow-hidden w-full h-full flex items-center justify-center"
                style={{
                  aspectRatio: aspectRatio === '1:1' ? '1/1' : 'auto',
                  maxHeight: aspectRatio === '1:1' ? '400px' : 'none'
                }}
              >
                {/* Live Shutter Stream */}
                {!capturedImage ? (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transition-transform duration-300"
                      style={{
                        transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
                        aspectRatio: aspectRatio === '1:1' ? '1/1' : 'auto',
                      }}
                    />
                    {/* Grid Overlay Guide lines */}
                    {showGrid && (
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-25">
                        <div className="border-r border-b border-white" />
                        <div className="border-r border-b border-white" />
                        <div className="border-b border-white" />
                        <div className="border-r border-b border-white" />
                        <div className="border-r border-b border-white" />
                        <div className="border-b border-white" />
                        <div className="border-r border-white" />
                        <div className="border-r border-white" />
                        <div />
                      </div>
                    )}
                  </>
                ) : (
                  // Freeze Frame Capture Preview
                  <img 
                    src={capturedImage} 
                    alt="Captured Lens Preview" 
                    className="w-full h-full object-cover rounded-2xl animate-fade-in"
                  />
                )}
              </div>
            )}
          </div>

          {/* Canvas for rendering frames in background */}
          <canvas ref={canvasRef} className="hidden" />

          {/* Shutter Capture & Confirmation Controls Footer */}
          <div className="bg-gradient-to-t from-black to-black/90 p-6 md:p-8 flex flex-col items-center justify-center gap-4 z-10 border-t border-zinc-900/50">
            {!capturedImage ? (
              <div className="flex items-center justify-between w-full max-w-xs gap-6">
                
                {/* Camera Flip Button */}
                <div className="w-12 h-12 flex items-center justify-center">
                  {hasMultipleCameras && (
                    <button 
                      type="button"
                      onClick={toggleFacingMode}
                      className="p-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-full hover:scale-110 active:scale-95 transition cursor-pointer text-zinc-300 hover:text-white"
                      title="Flip front/back camera"
                    >
                      <RotateCw className="w-5 h-5" />
                    </button>
                  )}
                </div>

                {/* Shutter Action */}
                <button
                  type="button"
                  disabled={permissionState !== 'granted'}
                  onClick={capturePhoto}
                  className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1.5 transition-all duration-300 ${
                    permissionState === 'granted' 
                      ? 'hover:scale-105 active:scale-90 cursor-pointer' 
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                >
                  <div className="w-full h-full bg-white rounded-full flex items-center justify-center font-bold text-black shadow-inner">
                    <Camera className="w-7 h-7 text-zinc-900" />
                  </div>
                </button>

                {/* Left side spacer to balance layout */}
                <div className="w-12 h-12" />

              </div>
            ) : (
              // Confirmation controls after snapshot is freeze-framed
              <div className="flex items-center justify-center gap-4 w-full max-w-xs">
                <button
                  type="button"
                  onClick={handleRetake}
                  className="flex-1 py-3 px-5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition"
                >
                  <Undo2 className="w-4 h-4" />
                  Retake
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="flex-1 py-3 px-5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition shadow-lg shadow-primary/20"
                >
                  <Check className="w-4 h-4" />
                  Keep Photo
                </button>
              </div>
            )}
            
            <p className="text-[10px] text-zinc-500 font-semibold tracking-wide">
              {capturedImage ? 'Satisfied with the shot? Confirm to upload!' : 'Tap center shutter button to capture image'}
            </p>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
