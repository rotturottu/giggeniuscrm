import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

const phoneCodes = [
  { code: '+63', label: '🇵🇭 +63' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+61', label: '🇦🇺 +61' },
  { code: '+81', label: '🇯🇵 +81' },
];

export default function BusinessSettings() {
  // Form State
  const [form, setForm] = useState({
    businessName: '',
    legalName: '',
    email: '',
    countryCode: '+63',
    phone: '',
    domain: '',
    industry: '',
    currency: 'USD'
  });

  // Error State
  const [errors, setErrors] = useState({
    email: '',
    phone: '',
    general: ''
  });

  // Logo Upload State
  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const fileInputRef = useRef(null);

  // Handle Logo Upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Generic input handler
  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors.general) setErrors(prev => ({ ...prev, general: '' }));
  };

  // Email Validation Handler
  const handleEmailChange = (e) => {
    const val = e.target.value;
    handleChange('email', val);
    
    if (val && !val.includes('@')) {
      setErrors(prev => ({ ...prev, email: 'Invalid email!' }));
    } else {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  };

  // Phone Validation Handler (Numbers Only)
  const handlePhoneChange = (e) => {
    const val = e.target.value;
    handleChange('phone', val);

    if (/[a-zA-Z]/.test(val)) {
      setErrors(prev => ({ ...prev, phone: 'Invalid Input!' }));
    } else {
      setErrors(prev => ({ ...prev, phone: '' }));
    }
  };

  // Save/Submit Handler
  const handleSave = () => {
    // 1. Check if all fields are filled
    const requiredFields = ['businessName', 'legalName', 'email', 'phone', 'domain', 'industry', 'currency'];
    const hasEmptyFields = requiredFields.some(field => !form[field] || form[field].toString().trim() === '');
    
    if (hasEmptyFields) {
      setErrors(prev => ({ ...prev, general: 'Please fill out all fields completely.' }));
      return;
    }

    // 2. Double-check email
    if (!form.email.includes('@')) {
      setErrors(prev => ({ ...prev, email: 'Invalid email! Must contain "@"' }));
      return;
    }

    // 3. Double-check phone for alphabets
    if (/[a-zA-Z]/.test(form.phone)) {
      setErrors(prev => ({ ...prev, phone: 'Invalid Input! Alphabets are not allowed.' }));
      return;
    }

    // If everything passes, clear errors and proceed
    setErrors({ email: '', phone: '', general: '' });
    
    // Example payload to send to your API:
    const payloadToSave = {
      ...form,
      fullPhone: `${form.countryCode} ${form.phone}`,
      logo: logoFile
    };
    
    console.log('Saving Data:', payloadToSave);
    alert('Settings Saved Successfully!'); // Replace with your actual toast/mutation
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-8 animate-in fade-in duration-300">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Business Settings</h2>
        <p className="text-gray-500 mt-1">Manage your company details, branding, and localization.</p>
      </div>

      <div className="space-y-6">
        {/* Business Logo */}
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center border-b border-gray-100 pb-6">
          <div className="w-24 h-24 rounded-xl bg-gray-50 border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden">
            {logoPreview ? (
              <img src={logoPreview} alt="Business Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-400 text-sm">No Logo</span>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-semibold text-gray-900">Business Logo</h4>
            <p className="text-sm text-gray-500">Recommended size: 256x256px (PNG or JPG)</p>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleLogoChange} 
            />
            <Button variant="outline" className="flex items-center gap-2 mt-2" onClick={() => fileInputRef.current.click()}>
              <Upload className="w-4 h-4" />
              Upload Logo
            </Button>
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Business Name *</label>
            <input 
              type="text" 
              value={form.businessName}
              onChange={(e) => handleChange('businessName', e.target.value)}
              placeholder="e.g., GigGenius"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Legal Business Name *</label>
            <input 
              type="text" 
              value={form.legalName}
              onChange={(e) => handleChange('legalName', e.target.value)}
              placeholder="e.g., GigGenius LLC"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Business Email *</label>
            <input 
              type="email" 
              value={form.email}
              onChange={handleEmailChange}
              placeholder="contact@giggenius.com"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.email ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
            />
            {errors.email && <p className="text-sm text-red-500 font-medium mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Business Phone *</label>
            <div className="flex gap-2">
              <select 
                value={form.countryCode} 
                onChange={(e) => handleChange('countryCode', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
              >
                {phoneCodes.map(pc => (
                  <option key={pc.code} value={pc.code}>{pc.label}</option>
                ))}
              </select>
              <div className="flex-1">
                <input 
                  type="text" 
                  value={form.phone}
                  onChange={handlePhoneChange}
                  placeholder="555-0000"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${errors.phone ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-500'}`}
                />
              </div>
            </div>
            {errors.phone && <p className="text-sm text-red-500 font-medium mt-1">{errors.phone}</p>}
          </div>

          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-gray-700">Branded Domain *</label>
            <div className="flex">
              <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                https://
              </span>
              <input 
                type="text" 
                value={form.domain}
                onChange={(e) => handleChange('domain', e.target.value)}
                placeholder="app.yourdomain.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Business Industry *</label>
            <select 
              value={form.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            >
              <option value="">Select an industry...</option>
              <option value="software">Software & Technology</option>
              <option value="marketing">Marketing & Agency</option>
              <option value="ecommerce">E-Commerce</option>
              <option value="consulting">Consulting</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Business Currency *</label>
            <select 
              value={form.currency}
              onChange={(e) => handleChange('currency', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-white"
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="GBP">GBP (£) - British Pound</option>
              <option value="CAD">CAD ($) - Canadian Dollar</option>
              <option value="AUD">AUD ($) - Australian Dollar</option>
            </select>
          </div>

        </div>

        {/* Dynamic Error Message Banner */}
        {errors.general && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm font-semibold flex items-center justify-between animate-in fade-in duration-300">
            {errors.general}
          </div>
        )}

        <div className="pt-6 border-t border-gray-100 flex justify-end">
          <Button 
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-lg font-semibold transition-all"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}