import React, { useState, useRef, useEffect } from 'react';
import { Phone, Mail, HelpCircle, X } from 'lucide-react';

/**
 * HelpContactDropdown Component
 * Displays a help icon that opens a contact card for the main administrator.
 */
const HelpContactDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 focus:outline-none transition-colors"
        aria-label="Help and Contact"
      >
        <HelpCircle className="h-6 w-6" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl overflow-hidden z-50 border border-blue-50 animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="p-4 flex items-center justify-between border-b border-gray-50 bg-gradient-to-r from-blue-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-blue-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-blue-700">Patrick Ferran</h3>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="p-4 space-y-4">
            {/* Phone */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Phone / WhatsApp</p>
                <a 
                  href="tel:+33680729025" 
                  className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  +33 6 80 72 90 25
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center gap-4 p-3 rounded-xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 font-medium">Email</p>
                <a 
                  href="mailto:patrick.ferran@hypsous.com" 
                  className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors"
                >
                  patrick.ferran@hypsous.com
                </a>
              </div>
            </div>
          </div>
          
          <div className="p-3 bg-gray-50 text-center border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Direct contact with the application owner
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HelpContactDropdown;
