import React, { useState, useRef, forwardRef } from 'react';
import type { ImageFile } from '../types';
import { CameraIcon, PaperclipIcon, SendIcon, XIcon } from './icons';
import { CameraModal } from './CameraModal';

interface MessageInputProps {
  onSendMessage: (text: string, images: ImageFile[] | null) => void;
  isLoading: boolean;
  text: string;
  onTextChange: (text: string) => void;
}

interface UploadableFile {
    id: string;
    file: File;
    previewUrl: string;
    progress: number;
    base64: string | null;
}

// Helper to convert a data URL to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
      throw new Error('Could not parse MIME type from data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}


export const MessageInput = forwardRef<HTMLInputElement, MessageInputProps>(
  ({ onSendMessage, isLoading, text, onTextChange }, ref) => {
    const [images, setImages] = useState<UploadableFile[]>([]);
    const [isCameraOpen, setCameraOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const newUploads: UploadableFile[] = Array.from(files).map(file => ({
        id: `${file.name}-${Date.now()}`,
        file,
        previewUrl: URL.createObjectURL(file),
        progress: 0,
        base64: null,
      }));

      setImages(prev => [...prev, ...newUploads]);
      newUploads.forEach(upload => processFile(upload));
    };
    
    const handleCameraCapture = (dataUrl: string) => {
        const file = dataURLtoFile(dataUrl, `capture-${Date.now()}.jpg`);
        const newUpload: UploadableFile = {
            id: `${file.name}-${Date.now()}`,
            file,
            previewUrl: URL.createObjectURL(file),
            progress: 100,
            base64: dataUrl
        };
        setImages(prev => [...prev, newUpload]);
        setCameraOpen(false);
    };

    const processFile = (upload: UploadableFile) => {
        const reader = new FileReader();
        reader.onprogress = (event) => {
            if (event.lengthComputable) {
                const progress = Math.round((event.loaded / event.total) * 100);
                setImages(prev => prev.map(img => img.id === upload.id ? { ...img, progress } : img));
            }
        };
        reader.onloadend = () => {
            setImages(prev => prev.map(img => img.id === upload.id ? { ...img, progress: 100, base64: reader.result as string } : img));
        };
        reader.readAsDataURL(upload.file);
    }

    const handleSend = () => {
      const loadedImages = images.filter(img => img.base64).map(img => ({
          name: img.file.name,
          type: img.file.type,
          base64: img.base64!,
      }));
      if ((text.trim() || loadedImages.length > 0) && !isLoading) {
        onSendMessage(text, loadedImages);
        setImages([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    };

    const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter') {
        handleSend();
      }
    };
    
    const removeImage = (idToRemove: string) => {
        setImages(prev => prev.filter(image => {
            if (image.id === idToRemove) {
                URL.revokeObjectURL(image.previewUrl);
                return false;
            }
            return true;
        }));
    };

    return (
      <>
        <CameraModal isOpen={isCameraOpen} onClose={() => setCameraOpen(false)} onCapture={handleCameraCapture} />
        <div className="bg-zinc-800/50 border-t border-zinc-700 backdrop-blur-sm">
            <div className="max-w-4xl mx-auto p-4">
            {images.length > 0 && (
                <div className="mb-3 px-2">
                    <div className="flex space-x-3 overflow-x-auto pb-2">
                        {images.map(image => (
                            <div key={image.id} className="relative flex-shrink-0 w-20 h-20 bg-zinc-700 rounded-lg group">
                                <img src={image.previewUrl} alt={image.file.name} className="h-full w-full rounded-lg object-cover" />
                                {image.progress < 100 &&
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-lg">
                                        <div className="w-10 h-10 border-2 border-zinc-500 border-t-amber-500 rounded-full animate-spin"></div>
                                    </div>
                                }
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-zinc-600/50 rounded-b-lg">
                                  <div className="h-1 bg-amber-500 rounded-b-lg" style={{ width: `${image.progress}%` }}></div>
                                </div>
                                <button onClick={() => removeImage(image.id)} className="absolute -top-2 -right-2 p-1 bg-zinc-800 rounded-full hover:bg-zinc-600 focus:outline-none focus:ring-2 focus:ring-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <XIcon className="h-4 w-4 text-zinc-300" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex items-center bg-zinc-800 rounded-full p-2">
                <input
                id="message-input"
                ref={ref}
                type="text"
                value={text}
                onChange={(e) => onTextChange(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question..."
                aria-label="Ask a question or describe your image"
                className="flex-1 bg-transparent px-4 py-2 text-zinc-100 placeholder-zinc-400 focus:outline-none"
                disabled={isLoading}
                />
                <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
                id="file-upload"
                multiple
                />
                <button onClick={() => setCameraOpen(true)} className="p-2 rounded-full hover:bg-zinc-700 cursor-pointer transition-colors">
                    <CameraIcon className="h-6 w-6 text-zinc-400" />
                </button>
                <label htmlFor="file-upload" className="p-2 rounded-full hover:bg-zinc-700 cursor-pointer transition-colors">
                    <PaperclipIcon className="h-6 w-6 text-zinc-400" />
                </label>
                <button
                    onClick={handleSend}
                    disabled={isLoading || (!text.trim() && images.some(img => !img.base64))}
                    className="ml-2 p-2.5 rounded-full bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-600 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                    <SendIcon className="h-6 w-6 text-white" />
                </button>
            </div>
            </div>
        </div>
      </>
    );
  }
);