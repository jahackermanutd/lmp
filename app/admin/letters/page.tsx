'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/admin/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/admin/Table';
import Modal from '@/app/components/admin/Modal';
import { Plus, Eye, Edit, Trash2, Search, Filter, Download, Archive } from 'lucide-react';

// Mock data
const initialLetters = [
  { id: '1', title: "O'yinchi shartnomasini uzaytirish", author: 'John Doe', status: 'Approved', type: 'Contract', date: '2025-01-15', content: "Ushbu xatda o'yinchi bilan tuzilgan shartnoma muddatini uzaytirish so'raladi." },
  { id: '2', title: 'Stadionni ijaraga olish kelishuvi', author: 'Sarah Smith', status: 'Pending', type: 'Agreement', date: '2025-01-14', content: 'Mazkur xatda stadiondan foydalanish uchun ijaraga olish shartlari keltirilgan.' },
  { id: '3', title: 'Homiylik taklifi', author: 'Mike Johnson', status: 'Draft', type: 'Proposal', date: '2025-01-13', content: "Hurmatli hamkor, ushbu taklif homiylik hamkorligini yo'lga qo'yish uchun taqdim etilmoqda." },
  { id: '4', title: "Transfer so'rovi xati", author: 'Emma Wilson', status: 'Approved', type: 'Request', date: '2025-01-12', content: "Jamoamiz o'yinchisini boshqa klubga o'tkazish bo'yicha rasmiy so'rov yuborilmoqda." },
  { id: '5', title: 'Jihozlar xarid buyurtmasi', author: 'David Brown', status: 'Pending', type: 'Order', date: '2025-01-11', content: 'Mazkur buyurtmada mashgulotlar uchun zarur jihozlarni xarid qilish haqida so\'rov mavjud.' },
  { id: '6', title: 'Tadbirga taklifnoma', author: 'John Doe', status: 'Approved', type: 'Invitation', date: '2025-01-10', content: "Sizni klubning yangi mavsum taqdimot tadbiriga taklif etamiz." },
];

const statusOptions = [
  { value: 'All', label: 'Barcha holatlar' },
  { value: 'Draft', label: 'Qoralama' },
  { value: 'Pending', label: 'Kutilmoqda' },
  { value: 'Approved', label: 'Tasdiqlangan' },
  { value: 'Rejected', label: 'Rad etilgan' },
];

const typeOptions = [
  { value: 'All', label: 'Barcha turlari' },
  { value: 'Contract', label: 'Shartnoma' },
  { value: 'Agreement', label: 'Kelishuv' },
  { value: 'Proposal', label: 'Taklif' },
  { value: 'Request', label: "So'rov" },
  { value: 'Order', label: 'Buyurtma' },
  { value: 'Invitation', label: 'Taklifnoma' },
];

const statusLabels: Record<string, string> = {
  Draft: 'Qoralama',
  Pending: 'Kutilmoqda',
  Approved: 'Tasdiqlangan',
  Rejected: 'Rad etilgan',
};

const typeLabels: Record<string, string> = {
  Contract: 'Shartnoma',
  Agreement: 'Kelishuv',
  Proposal: 'Taklif',
  Request: "So'rov",
  Order: 'Buyurtma',
  Invitation: 'Taklifnoma',
};

export default function LettersPage() {
  const [letters, setLetters] = useState(initialLetters);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<typeof initialLetters[0] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');

  const filteredLetters = letters.filter(letter => {
    const matchesSearch = letter.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         letter.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || letter.status === statusFilter;
    const matchesType = typeFilter === 'All' || letter.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleView = (letter: typeof initialLetters[0]) => {
    setSelectedLetter(letter);
    setIsViewModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Ushbu xatni o'chirishga ishonchingiz komilmi?")) {
      setLetters(letters.filter(l => l.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Xatlar boshqaruvi</h1>
          <p className="text-gray-600 mt-1">Barcha xat va hujjatlarni boshqaring</p>
        </div>
        <Link
          href="/admin/letters/new-letter"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Yangi xat yaratish
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Xatlarni qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {typeOptions.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Letters Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Barcha xatlar ({filteredLetters.length})</CardTitle>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download size={16} />
                Eksport qilish
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Archive size={16} />
                Arxivlash
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Sarlavha</TableHead>
                <TableHead>Muallif</TableHead>
                <TableHead>Turi</TableHead>
                <TableHead>Holati</TableHead>
                <TableHead>Sana</TableHead>
                <TableHead className="text-right">Harakatlar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLetters.map((letter) => (
                <TableRow key={letter.id}>
                  <TableCell className="font-medium">{letter.title}</TableCell>
                  <TableCell>{letter.author}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      {typeLabels[letter.type] ?? letter.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      letter.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      letter.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      letter.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {statusLabels[letter.status] ?? letter.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{letter.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleView(letter)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Ko'rish"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(letter.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Letter Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={selectedLetter?.title || "Xatni ko'rib chiqish"}
        size="lg"
      >
        {selectedLetter && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Muallif</p>
                <p className="font-medium">{selectedLetter.author}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Turi</p>
                <p className="font-medium">{typeLabels[selectedLetter.type] ?? selectedLetter.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Holati</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  selectedLetter.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  selectedLetter.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {statusLabels[selectedLetter.status] ?? selectedLetter.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Sana</p>
                <p className="font-medium">{selectedLetter.date}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Mazmuni</h4>
              <div className="p-4 bg-white border border-gray-200 rounded-lg min-h-[200px]">
                <p className="text-gray-700">{selectedLetter.content}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                PDF yuklab olish
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Xatni tahrirlash
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
