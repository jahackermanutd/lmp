'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/admin/Card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/app/components/admin/Table';
import Modal from '@/app/components/admin/Modal';
import { Plus, Eye, Edit, Trash2, Search, Filter, Download, Archive } from 'lucide-react';

// Mock data
const initialLetters = [
  { id: '1', title: 'Player Contract Extension', author: 'John Doe', status: 'Approved', type: 'Contract', date: '2025-01-15', content: 'This letter requests an extension...' },
  { id: '2', title: 'Stadium Rental Agreement', author: 'Sarah Smith', status: 'Pending', type: 'Agreement', date: '2025-01-14', content: 'We hereby request rental of...' },
  { id: '3', title: 'Sponsorship Proposal', author: 'Mike Johnson', status: 'Draft', type: 'Proposal', date: '2025-01-13', content: 'Dear potential sponsor...' },
  { id: '4', title: 'Transfer Request Letter', author: 'Emma Wilson', status: 'Approved', type: 'Request', date: '2025-01-12', content: 'We formally request transfer...' },
  { id: '5', title: 'Equipment Purchase Order', author: 'David Brown', status: 'Pending', type: 'Order', date: '2025-01-11', content: 'This purchase order is for...' },
  { id: '6', title: 'Event Invitation Letter', author: 'John Doe', status: 'Approved', type: 'Invitation', date: '2025-01-10', content: 'You are cordially invited...' },
];

const statusOptions = ['All', 'Draft', 'Pending', 'Approved', 'Rejected'];
const typeOptions = ['All', 'Contract', 'Agreement', 'Proposal', 'Request', 'Order', 'Invitation'];

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
    if (confirm('Are you sure you want to delete this letter?')) {
      setLetters(letters.filter(l => l.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Letters Management</h1>
          <p className="text-gray-600 mt-1">Manage all letters and documents</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          <Plus size={20} />
          Create Letter
        </button>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search letters..."
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
              <option key={status} value={status}>{status} Status</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {typeOptions.map(type => (
              <option key={type} value={type}>{type} Type</option>
            ))}
          </select>
        </div>
      </Card>

      {/* Letters Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Letters ({filteredLetters.length})</CardTitle>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Download size={16} />
                Export
              </button>
              <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Archive size={16} />
                Archive
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLetters.map((letter) => (
                <TableRow key={letter.id}>
                  <TableCell className="font-medium">{letter.title}</TableCell>
                  <TableCell>{letter.author}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                      {letter.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      letter.status === 'Approved' ? 'bg-green-100 text-green-700' :
                      letter.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                      letter.status === 'Draft' ? 'bg-gray-100 text-gray-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {letter.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-gray-600">{letter.date}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleView(letter)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Edit"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(letter.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete"
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
        title={selectedLetter?.title || 'Letter Preview'}
        size="lg"
      >
        {selectedLetter && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="text-sm text-gray-600">Author</p>
                <p className="font-medium">{selectedLetter.author}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Type</p>
                <p className="font-medium">{selectedLetter.type}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                  selectedLetter.status === 'Approved' ? 'bg-green-100 text-green-700' :
                  selectedLetter.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {selectedLetter.status}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-600">Date</p>
                <p className="font-medium">{selectedLetter.date}</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Content</h4>
              <div className="p-4 bg-white border border-gray-200 rounded-lg min-h-[200px]">
                <p className="text-gray-700">{selectedLetter.content}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-4">
              <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Download PDF
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Edit Letter
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
