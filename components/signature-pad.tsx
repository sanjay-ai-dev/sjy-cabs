'use client';

import React, { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react';

export interface SignaturePadRef {
  getSignatureDataUrl: () => string | null;
  clear: () => void;
}

interface SignaturePadProps {
  onSignatureChange?: (hasSignature: boolean) => void;
}

export const SignaturePad = forwardRef<SignaturePadRef, SignaturePadProps>(
  ({ onSignatureChange }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [hasContent, setHasContent] = useState(false);

    // Keep track of the last point to draw a continuous line
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    useImperativeHandle(ref, () => ({
      getSignatureDataUrl: () => {
        if (uploadedImage) {
          return uploadedImage;
        }
        if (!hasContent || !canvasRef.current) {
          return null;
        }
        return canvasRef.current.toDataURL('image/png');
      },
      clear: handleClear,
    }));

    const updateContentState = (state: boolean) => {
      setHasContent(state);
      if (onSignatureChange) {
        onSignatureChange(state);
      }
    };

    const getCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      if (!canvasRef.current) return null;
      const rect = canvasRef.current.getBoundingClientRect();
      
      let clientX, clientY;
      
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (uploadedImage) return; // Prevent drawing if image uploaded
      
      const coords = getCoordinates(e);
      if (!coords || !canvasRef.current) return;
      
      setIsDrawing(true);
      lastPos.current = coords;
      
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(coords.x, coords.y);
        ctx.lineTo(coords.x, coords.y);
        ctx.stroke();
      }
      
      if (!hasContent) {
        updateContentState(true);
      }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
      e.preventDefault();
      if (!isDrawing || !lastPos.current || !canvasRef.current || uploadedImage) return;
      
      const coords = getCoordinates(e);
      if (!coords) return;
      
      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        // Use quadratic curves for smoother lines
        const xc = (lastPos.current.x + coords.x) / 2;
        const yc = (lastPos.current.y + coords.y) / 2;
        
        ctx.quadraticCurveTo(lastPos.current.x, lastPos.current.y, xc, yc);
        ctx.stroke();
      }
      
      lastPos.current = coords;
    };

    const stopDrawing = () => {
      setIsDrawing(false);
      lastPos.current = null;
    };

    const handleClear = () => {
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          // Set white background again
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        }
      }
      setUploadedImage(null);
      updateContentState(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          if (event.target?.result) {
            setUploadedImage(event.target.result as string);
            updateContentState(true);
          }
        };
        reader.readAsDataURL(file);
      }
    };

    // Initialize canvas
    useEffect(() => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Set white background
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          ctx.strokeStyle = '#000000';
          ctx.lineWidth = 2.5;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
        }
      }
    }, []);
    
    // Prevent scrolling while drawing on touch devices
    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas) {
        const preventDefault = (e: Event) => e.preventDefault();
        canvas.addEventListener('touchstart', preventDefault, { passive: false });
        canvas.addEventListener('touchmove', preventDefault, { passive: false });
        
        return () => {
          canvas.removeEventListener('touchstart', preventDefault);
          canvas.removeEventListener('touchmove', preventDefault);
        };
      }
    }, []);

    return (
      <div className="glass-card flex flex-col items-center gap-4 p-4 rounded-xl border border-hairline w-full max-w-md mx-auto print:hidden">
        <div className="flex w-full justify-between items-center mb-1">
          <span className="text-sm font-semibold text-content">Sign Below</span>
          <span className="text-xs text-content-muted">Draw or Upload</span>
        </div>
        
        <div className="relative w-full h-48 border border-hairline rounded-lg overflow-hidden bg-white shadow-inner">
          {uploadedImage ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white">
              <img src={uploadedImage} alt="Uploaded signature" className="max-w-full max-h-full object-contain" />
            </div>
          ) : (
            <canvas
              ref={canvasRef}
              width={400} // Set fixed resolution, styled via CSS
              height={192}
              className="w-full h-full cursor-crosshair touch-none"
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              // Touch events are handled partly by React, partly by the useEffect to prevent default
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              onTouchCancel={stopDrawing}
            />
          )}
        </div>
        
        <div className="flex w-full gap-3 justify-between items-center mt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-xs font-medium px-3 py-1.5 rounded-md bg-surface-2 text-content-secondary hover:text-content hover:bg-canvas transition-colors border border-hairline"
            >
              Upload Image
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>
          
          <button
            type="button"
            onClick={handleClear}
            className="text-xs font-medium px-3 py-1.5 rounded-md text-danger hover:bg-danger/10 transition-colors"
          >
            Clear
          </button>
        </div>
      </div>
    );
  }
);

SignaturePad.displayName = 'SignaturePad';
