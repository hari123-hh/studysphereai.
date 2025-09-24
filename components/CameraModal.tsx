import React, { useState, useRef, useEffect, useCallback } from 'react';
import { XIcon } from './icons';

interface CameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (dataUrl: string) => void;
}

export const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    const cleanup = useCallback(() => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }
    }, [stream]);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } })
                .then(stream => {
                    setStream(stream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                })
                .catch(err => {
                    console.error("Camera access error:", err);
                    setError("Could not access camera. Please check permissions.");
                });
        } else {
            cleanup();
        }
        return cleanup;
    }, [isOpen, cleanup]);

    const handleCapture = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                onCapture(dataUrl);
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <button onClick={onClose} className="absolute top-4 right-4 text-white p-2 bg-black/30 rounded-full">
                <XIcon className="h-8 w-8" />
            </button>

            <div className="relative w-full h-full max-w-4xl max-h-[80vh] flex items-center justify-center">
                {error ? (
                    <div className="text-center text-red-400 bg-red-900/50 p-6 rounded-lg">
                        <h3 className="text-xl font-bold mb-2">Camera Error</h3>
                        <p>{error}</p>
                    </div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-contain"></video>
                )}
            </div>
            
            {!error && (
                <div className="absolute bottom-10">
                    <button 
                        onClick={handleCapture} 
                        className="w-20 h-20 rounded-full bg-white border-4 border-zinc-400 focus:outline-none focus:ring-4 focus:ring-amber-500"
                        aria-label="Take picture"
                    ></button>
                </div>
            )}
        </div>
    );
};