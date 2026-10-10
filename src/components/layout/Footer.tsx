import Link from "next/link";
import { Globe, MessageSquare, Share2, Video, Mail, MapPin, Phone } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white font-bold">
                CG
              </div>
              <span className="font-bold text-xl tracking-tight text-white">
                Computer Garage
              </span>
            </div>
            <p className="text-sm text-slate-400 mb-6">
              Your ultimate destination for high-performance PC parts and accessories. Build your dream machine with the best components on the market.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-slate-400 hover:text-blue-500 transition-colors">
                <Globe className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-blue-500 transition-colors">
                <MessageSquare className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-blue-500 transition-colors">
                <Share2 className="h-5 w-5" />
              </Link>
              <Link href="#" className="text-slate-400 hover:text-blue-500 transition-colors">
                <Video className="h-5 w-5" />
              </Link>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/" className="hover:text-blue-500 transition-colors">Home</Link></li>
              <li><Link href="/products" className="hover:text-blue-500 transition-colors">Products</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">About Us</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">Contact</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">Blog</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Customer Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="#" className="hover:text-blue-500 transition-colors">Track Order</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">Returns & Exchanges</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">Shipping Info</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">FAQs</Link></li>
              <li><Link href="#" className="hover:text-blue-500 transition-colors">Warranty Info</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-blue-500 shrink-0" />
                <span>Unit 4B, Cyberzone, SM Megamall,<br />Mandaluyong City, Metro Manila 1550</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-blue-500 shrink-0" />
                <span>+63 2 8123 4567</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-blue-500 shrink-0" />
                <span>support@computergarage.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Computer Garage. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-slate-300">Privacy Policy</Link>
            <Link href="#" className="hover:text-slate-300">Terms & Conditions</Link>
            <Link href="#" className="hover:text-slate-300">Cookie Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
