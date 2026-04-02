'use client';

import { useEffect, useMemo, useState } from 'react';
import api from '@/lib/axios';
import AdminPagination from '@/components/admin/AdminPagination';
import { Calendar, Mail, Trash2 } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

const PAGE_SIZE = 10;

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [page, setPage] = useState(1);

  async function fetchContacts() {
    try {
      const res = await api.get('/api/admin/contacts');
      setContacts(res.data);
    } catch {
      console.error('Failed to fetch contacts');
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchContacts();
  }, []);

  const totalPages = Math.max(1, Math.ceil(contacts.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);

  const paginatedContacts = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return contacts.slice(start, start + PAGE_SIZE);
  }, [contacts, currentPage]);

  const selectedOnPage = paginatedContacts
    .filter((contact) => selectedIds.includes(contact.id))
    .map((contact) => contact.id);

  const isPageFullySelected = paginatedContacts.length > 0 && selectedOnPage.length === paginatedContacts.length;

  const formatDate = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleString('zh-CN', { hour12: false });
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => (
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id]
    ));
  };

  const toggleSelectPage = () => {
    const pageIds = paginatedContacts.map((contact) => contact.id);
    setSelectedIds((prev) => {
      if (isPageFullySelected) {
        return prev.filter((id) => !pageIds.includes(id));
      }

      return Array.from(new Set([...prev, ...pageIds]));
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`/api/admin/contacts/${id}`);
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      fetchContacts();
    } catch {
      console.error('Failed to delete contact');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} selected message(s)?`)) return;

    try {
      await api.post('/api/admin/contacts/batch-delete', { ids: selectedIds });
      setSelectedIds([]);
      fetchContacts();
    } catch {
      console.error('Failed to delete selected contacts');
    }
  };

  return (
    <div className="fade-up flex min-h-full flex-col">
      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-wide">User Messages</h1>
          <p className="mt-2 text-sm text-slate-500">
            Total {contacts.length} message{contacts.length === 1 ? '' : 's'}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={toggleSelectPage}
            disabled={paginatedContacts.length === 0}
            className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPageFullySelected ? 'Unselect This Page' : 'Select This Page'}
          </button>
          <button
            type="button"
            onClick={handleBatchDelete}
            disabled={selectedIds.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-red-300"
          >
            <Trash2 size={16} />
            Delete Selected ({selectedIds.length})
          </button>
        </div>
      </div>

      <div className="flex-1">
        <div className="grid grid-cols-1 gap-4">
          {paginatedContacts.map((contact) => (
            <div key={contact.id} className="admin-panel overflow-hidden">
              <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-start">
                <div className="w-full max-w-[22rem] shrink-0">
                  <div className="flex items-start gap-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(contact.id)}
                      onChange={() => toggleSelect(contact.id)}
                      className="mt-1 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                      aria-label={`Select message from ${contact.name}`}
                    />
                    <div className="min-w-0 space-y-3">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-lg font-semibold text-slate-900">{contact.name}</span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">
                          #{contact.id}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-slate-500">
                        <div className="flex items-start gap-2">
                          <Mail size={14} />
                          <span className="min-w-0 break-all leading-6">{contact.email}</span>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar size={14} />
                          <span className="leading-6">{formatDate(contact.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="min-w-0 flex-1 space-y-4">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Subject</div>
                    <div className="mt-1 break-words text-sm font-medium text-slate-700">
                      {contact.subject || 'No subject'}
                    </div>
                  </div>
                  <div className="min-h-[11rem] min-w-0 rounded-2xl border border-slate-200 bg-white px-4 py-4">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Message</div>
                    <div className="mt-2 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                      {contact.message}
                    </div>
                  </div>
                </div>

                <div className="flex lg:justify-end">
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}

          {contacts.length === 0 && (
            <div className="text-center py-20 admin-panel text-gray-500">
              No messages yet.
            </div>
          )}
        </div>
      </div>

      {contacts.length > PAGE_SIZE && (
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPrevious={() => setPage(Math.max(1, currentPage - 1))}
          onNext={() => setPage(Math.min(totalPages, currentPage + 1))}
        />
      )}
    </div>
  );
}
