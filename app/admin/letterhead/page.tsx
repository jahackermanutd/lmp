'use client';

import { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/app/components/admin/Card';
import { Upload, X, Save, RotateCcw } from 'lucide-react';

export default function LetterheadPage() {
  const [formData, setFormData] = useState({
    orgName: 'Football Club eBolt',
    address: '123 Stadium Street, Tashkent, Uzbekistan',
    phone: '+998 71 123 4567',
    email: 'info@ebolt.uz',
    website: 'www.ebolt.uz',
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [headerPreview, setHeaderPreview] = useState<string | null>(null);
  const [footerPreview, setFooterPreview] = useState<string | null>(null);

  const handleFileUpload = (type: 'logo' | 'header' | 'footer', e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'logo') setLogoPreview(result);
        else if (type === 'header') setHeaderPreview(result);
        else setFooterPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setFormData({
      orgName: 'Football Club eBolt',
      address: '123 Stadium Street, Tashkent, Uzbekistan',
      phone: '+998 71 123 4567',
      email: 'info@ebolt.uz',
      website: 'www.ebolt.uz',
    });
    setLogoPreview(null);
    setHeaderPreview(null);
    setFooterPreview(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Letterhead & Design Settings</h1>
        <p className="text-gray-600 mt-1">Customize your letter template and branding</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Logo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {logoPreview ? (
                  <div className="relative w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <img src={logoPreview} alt="Logo preview" className="max-h-32 object-contain" />
                    <button
                      onClick={() => setLogoPreview(null)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-40 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload size={32} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload logo</span>
                    <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('logo', e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Header Image */}
          <Card>
            <CardHeader>
              <CardTitle>Header Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {headerPreview ? (
                  <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <img src={headerPreview} alt="Header preview" className="max-h-24 object-contain" />
                    <button
                      onClick={() => setHeaderPreview(null)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload size={28} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload header</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('header', e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Footer Image */}
          <Card>
            <CardHeader>
              <CardTitle>Footer Image</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {footerPreview ? (
                  <div className="relative w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                    <img src={footerPreview} alt="Footer preview" className="max-h-24 object-contain" />
                    <button
                      onClick={() => setFooterPreview(null)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                    <Upload size={28} className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload footer</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload('footer', e)}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Organization Information */}
          <Card>
            <CardHeader>
              <CardTitle>Organization Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                  <input
                    type="text"
                    value={formData.orgName}
                    onChange={(e) => setFormData({ ...formData, orgName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Save size={20} />
              Save Settings
            </button>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RotateCcw size={20} />
              Reset to Default
            </button>
          </div>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white border-2 border-gray-300 rounded-lg p-6 space-y-4 shadow-lg" style={{ aspectRatio: '210/297' }}>
                {/* Header */}
                {headerPreview ? (
                  <img src={headerPreview} alt="Header" className="w-full h-12 object-cover" />
                ) : (
                  <div className="w-full h-12 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-400">Header</span>
                  </div>
                )}

                {/* Logo and Info */}
                <div className="flex items-start gap-4">
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-16 h-16 object-contain" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                      <span className="text-xs text-gray-400">Logo</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{formData.orgName}</h3>
                    <p className="text-xs text-gray-600 mt-1">{formData.address}</p>
                    <p className="text-xs text-gray-600">{formData.phone}</p>
                    <p className="text-xs text-gray-600">{formData.email}</p>
                  </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 py-4">
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>

                {/* Footer */}
                {footerPreview ? (
                  <img src={footerPreview} alt="Footer" className="w-full h-8 object-cover" />
                ) : (
                  <div className="w-full h-8 bg-gray-100 rounded flex items-center justify-center">
                    <span className="text-xs text-gray-400">Footer</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
