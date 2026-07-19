import { CarFront, Mail, Phone, MapPin, Clock, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 w-full border-t border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60 backdrop-blur-xl transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          
          {/* Column 1: Intro / About Us */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-brand-500 rounded-lg text-white shadow-lg shadow-brand-500/30">
                <CarFront size={22} />
              </div>
              <span className="font-bold text-xl tracking-tight text-slate-900 dark:text-white">
                AutoLuxe
              </span>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              AutoLuxe is a premier dealership inventory platform delivering luxury, performance, and reliability. Explore our curated fleet of sedans, SUVs, electric vehicles, and sports coupes with real-time stock management.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/50 border border-brand-200 dark:border-brand-800/50 w-fit px-3 py-1.5 rounded-full">
              <ShieldCheck size={14} /> Certified Premier Dealership
            </div>
          </div>

          {/* Column 2: Working Hours */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock size={18} className="text-brand-500" /> Showroom Hours
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                <span>Monday – Friday:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">9:00 AM – 8:00 PM</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 dark:border-slate-800/60 pb-1.5">
                <span>Saturday:</span>
                <span className="font-semibold text-slate-900 dark:text-slate-200">10:00 AM – 6:00 PM</span>
              </li>
              <li className="flex justify-between pb-1.5">
                <span>Sunday:</span>
                <span className="font-semibold text-brand-600 dark:text-brand-400">By Appointment Only</span>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact Info */}
          <div className="flex flex-col gap-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Phone size={18} className="text-brand-500" /> Contact Info
            </h3>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="text-brand-500 shrink-0 mt-0.5" />
                <span>100 Luxury Motor Way, Automobile City, CA 90210</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="text-brand-500 shrink-0" />
                <span>+1 (800) 555-LUXE</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="text-brand-500 shrink-0" />
                <span>concierge@autoluxe-inventory.com</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Centered Copyright Line */}
        <div className="mt-12 pt-8 border-t border-slate-200/80 dark:border-slate-800/80 text-center">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            © 2026 AutoLuxe Inventory Systems. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
