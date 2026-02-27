'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { Mail, Phone, Calendar, Trash2 } from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  email: string;
  phone: string;
  message: string;
  created_at: string;
}

export default function ContactsAdmin() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  async function fetchContacts() {
    try {
      const res = await api.get('/admin/contacts');
      setContacts(res.data);
    } catch (err) {
      console.error('Failed to fetch contacts');
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchContacts();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    try {
      await api.delete(`/admin/contacts/${id}`);
      fetchContacts();
    } catch (err) {
      console.error('Failed to delete contact');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-wide mb-8">User Messages</h1>

      <div className="grid grid-cols-1 gap-6">
        {contacts.map((contact) => (
          <div key={contact.id} className="admin-panel p-6 relative group">
            <button
              onClick={() => handleDelete(contact.id)}
              className="absolute top-4 right-4 text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 size={18} />
            </button>

            <div className="flex flex-wrap gap-6 mb-4 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{contact.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} />
                {contact.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} />
                {contact.phone}
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={14} />
                {new Date(contact.created_at).toLocaleString()}
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-xl text-gray-700 whitespace-pre-wrap">
              {contact.message}
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
  );
}
