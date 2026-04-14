'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { HOME_HERO_IMAGE_OBJECT_POSITION } from '@/lib/hero-image';

interface ImageCropInlineProps {
  file: File | null;
  title?: string;
  outputWidth: number;
  outputHeight: number;
  onCancel: () => void;
  onConfirm: (file: File) => Promise<void> | void;
}

const CROP_BOX_WIDTH = 720;

function createImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new window.Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('Failed to load image'));
    image.src = url;
  });
}

export default function ImageCropInline({
  file,
  title = 'Crop Home Hero Image',
  outputWidth,
  outputHeight,
  onCancel,
  onConfirm,
}: ImageCropInlineProps) {
  const [previewUrl, setPreviewUrl] = useState('');
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const cropWidth = CROP_BOX_WIDTH;
  const cropHeight = Math.round((CROP_BOX_WIDTH * outputHeight) / outputWidth);

  useEffect(() => {
    if (!file) {
      setPreviewUrl('');
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setSaving(false);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setSaving(false);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  const cropperStyle = useMemo(
    () => ({
      containerStyle: {
        width: `${cropWidth}px`,
        height: `${cropHeight}px`,
        background: '#dbe4f0',
        borderRadius: '1.5rem',
      },
      cropAreaStyle: {
        border: '2px dashed rgba(255,255,255,0.95)',
        boxShadow: '0 0 0 9999px rgba(15,23,42,0.18)',
        color: 'rgba(255,255,255,0.55)',
      },
      mediaStyle: {
        objectPosition: HOME_HERO_IMAGE_OBJECT_POSITION,
      },
    }),
    [cropHeight, cropWidth],
  );

  const handleCropComplete = useCallback((_croppedArea: Area, nextPixels: Area) => {
    setCroppedAreaPixels(nextPixels);
  }, []);

  const handleConfirm = async () => {
    if (!previewUrl || !croppedAreaPixels) return;
    setSaving(true);

    try {
      const image = await createImage(previewUrl);
      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Failed to initialize crop canvas');

      context.drawImage(
        image,
        croppedAreaPixels.x,
        croppedAreaPixels.y,
        croppedAreaPixels.width,
        croppedAreaPixels.height,
        0,
        0,
        outputWidth,
        outputHeight,
      );

      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((result) => {
          if (result) resolve(result);
          else reject(new Error('Failed to export cropped image'));
        }, file?.type || 'image/jpeg', 0.92);
      });

      const extension = (file?.name.split('.').pop() || 'jpg').toLowerCase();
      const croppedFile = new File([blob], `home-hero-cropped.${extension}`, {
        type: blob.type || file?.type || 'image/jpeg',
      });

      await onConfirm(croppedFile);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to crop image';
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  if (!file) return null;

  return (
    <div className="mt-5 rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-5">
      <div className="flex flex-col gap-2 border-b border-slate-200 pb-4">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-500">
          Drag the image to frame the visible area. This cropper follows the fixed-frame interaction pattern used by mainstream image upload tools.
        </p>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div className="overflow-x-auto pb-2">
          <div className="relative" style={{ width: cropWidth, height: cropHeight }}>
            {previewUrl && (
              <Cropper
                image={previewUrl}
                crop={crop}
                zoom={zoom}
                aspect={outputWidth / outputHeight}
                minZoom={1}
                maxZoom={3}
                showGrid
                zoomWithScroll={false}
                objectFit="cover"
                cropShape="rect"
                style={cropperStyle}
                onCropChange={setCrop}
                onCropComplete={handleCropComplete}
                onZoomChange={setZoom}
              />
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
            <p className="font-medium text-slate-900">Output Size</p>
            <p className="mt-2">{outputWidth} × {outputHeight}px</p>
            <p>Display position: top center</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-600">
            <p className="font-medium text-slate-900">How To Use</p>
            <p className="mt-2">Drag to move the image inside the fixed crop frame.</p>
            <p>Use zoom only when you need finer framing.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.01}
              value={zoom}
              onChange={(event) => setZoom(Number(event.target.value))}
              className="mt-3 w-full"
            />
            <div className="mt-2 text-xs text-slate-500">{zoom.toFixed(2)}x</div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-3">
        <button type="button" onClick={onCancel} disabled={saving} className="btn-secondary px-5 py-2.5 disabled:opacity-60">
          Cancel
        </button>
        <button type="button" onClick={() => void handleConfirm()} disabled={!croppedAreaPixels || saving} className="btn-primary px-5 py-2.5 disabled:opacity-60">
          {saving ? 'Cropping...' : 'Crop And Upload'}
        </button>
      </div>
    </div>
  );
}
