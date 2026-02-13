'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import 'react-quill-new/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link', 'image'],
    ['clean'],
  ],
};

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
}

export default function Editor({ value, onChange }: EditorProps) {
  const [mode, setMode] = useState<'markdown' | 'rich'>('markdown');

  return (
    <div className="bg-white">
      <div className="flex items-center gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMode('markdown')}
          className={`px-3 py-1 rounded border ${mode === 'markdown' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700'}`}
        >
          Markdown
        </button>
        <button
          type="button"
          onClick={() => setMode('rich')}
          className={`px-3 py-1 rounded border ${mode === 'rich' ? 'bg-gray-900 text-white border-gray-900' : 'bg-gray-100 text-gray-700'}`}
        >
          富文本
        </button>
      </div>
      {mode === 'markdown' ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full h-64 px-3 py-2 border rounded-lg font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="支持 Markdown 语法，例如：# 标题、**加粗**、- 列表 等"
        />
      ) : (
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          className="h-64 mb-12"
        />
      )}
    </div>
  );
}
