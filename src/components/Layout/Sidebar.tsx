
import AppSidebar from './AppSidebar';
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

// مكون مؤقت للتوافق العكسي - يجب استخدام AppLayout بدلاً منه
export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return null; // هذا المكون لم يعد مستخدماً
}
