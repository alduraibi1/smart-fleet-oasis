
import {
  LayoutDashboard,
  Car,
  Users,
  FileText,
  Wrench,
  Package,
  Truck,
  UserCheck,
  Calculator,
  BarChart3,
  Settings,
  Bell
} from "lucide-react"
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"

interface NavItemProps {
  title: string
  icon: any
  href: string
  roles: string[]
}

const AppSidebar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  const fetchUserAndProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    
    if (user) {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to fetch profile data.",
          variant: "destructive",
        })
      } else {
        setProfile(profileData)
      }
    }
  }

  useEffect(() => {
    fetchUserAndProfile()
  }, [])

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error("Error signing out:", error)
      toast({
        title: "Error",
        description: "Failed to sign out.",
        variant: "destructive",
      })
    } else {
      navigate('/auth')
      toast({
        title: "Success",
        description: "Signed out successfully.",
      })
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const NavItem = ({ title, icon: Icon, href, roles }: NavItemProps) => {
    const isActive = location.pathname === href
    const userRole = profile?.role || 'employee' // Default role

    if (!roles.includes(userRole)) {
      return null // Skip rendering if user role is not allowed
    }

    return (
      <li>
        <Button
          variant={isActive ? "default" : "ghost"}
          className="w-full justify-start font-normal"
          onClick={() => {
            navigate(href)
            closeSidebar()
          }}
        >
          <Icon className="mr-2 h-4 w-4" />
          <span>{title}</span>
        </Button>
      </li>
    )
  }

  const menuItems = [
    {
      title: "لوحة التحكم",
      icon: LayoutDashboard,
      href: "/dashboard",
      roles: ["admin", "manager", "employee"]
    },
    {
      title: "المركبات",
      icon: Car,
      href: "/vehicles",
      roles: ["admin", "manager", "employee"]
    },
    {
      title: "العملاء",
      icon: Users,
      href: "/customers",
      roles: ["admin", "manager", "employee"]
    },
    {
      title: "العقود",
      icon: FileText,
      href: "/contracts",
      roles: ["admin", "manager", "employee"]
    },
    {
      title: "الصيانة",
      icon: Wrench,
      href: "/maintenance",
      roles: ["admin", "manager", "mechanic"]
    },
    {
      title: "المخزون",
      icon: Package,
      href: "/inventory",
      roles: ["admin", "manager", "inventory_manager"]
    },
    {
      title: "الموردين",
      icon: Truck,
      href: "/suppliers",
      roles: ["admin", "manager", "inventory_manager"]
    },
    {
      title: "الملاك",
      icon: UserCheck,
      href: "/owners",
      roles: ["admin", "manager"]
    },
    {
      title: "التنبيهات الذكية",
      icon: Bell,
      href: "/notifications",
      roles: ["admin", "manager", "employee"]
    },
    {
      title: "المحاسبة",
      icon: Calculator,
      href: "/accounting",
      roles: ["admin", "manager", "accountant"]
    },
    {
      title: "التقارير",
      icon: BarChart3,
      href: "/reports",
      roles: ["admin", "manager"]
    },
    {
      title: "الموارد البشرية",
      icon: Users,
      href: "/hr",
      roles: ["admin", "hr_manager"]
    },
    {
      title: "إدارة النظام",
      icon: Settings,
      href: "/system-management",
      roles: ["admin"]
    }
  ];

  return (
    <>
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <LayoutDashboard className="h-5 w-5 rotate-0 sm:rotate-0" />
            <span className="sr-only">Toggle Navigation Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pr-0">
          <ScrollArea className="h-[calc(100vh-10rem)] pl-6 pb-6">
            <SheetHeader className="px-4 pb-4 pt-6 text-left">
              <SheetTitle>القائمة</SheetTitle>
              <SheetDescription>
                اختر ما ترغب في تصفحه من القائمة الجانبية.
              </SheetDescription>
            </SheetHeader>
            <nav className="grid gap-6 px-4">
              <ul className="grid gap-1">
                {menuItems.map((item) => (
                  <NavItem key={item.href} {...item} />
                ))}
              </ul>
            </nav>
          </ScrollArea>
          <SheetFooter user={user} profile={profile} handleSignOut={handleSignOut} />
        </SheetContent>
      </Sheet>
      <div className="flex flex-col space-y-4">
        <div className="border-b px-4 pb-2">
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <LayoutDashboard className="h-5 w-5 rotate-0 sm:rotate-0" />
            <span className="sr-only">Toggle Navigation Menu</span>
          </Button>
        </div>
        <div className="flex-1 space-y-2 p-4">
          <h2 className="text-2xl font-semibold tracking-tight">القائمة</h2>
          <p className="text-muted-foreground">
            اختر ما ترغب في تصفحه من القائمة الجانبية.
          </p>
        </div>
        <nav className="flex-1">
          <ScrollArea className="h-[calc(100vh-10rem)] pb-6">
            <div className="space-y-1">
              {menuItems.map((item) => (
                <NavItem key={item.href} {...item} />
              ))}
            </div>
          </ScrollArea>
        </nav>
        <SheetFooter user={user} profile={profile} handleSignOut={handleSignOut} />
      </div>
    </>
  )
}

interface SheetFooterProps {
  user: any
  profile: any
  handleSignOut: () => Promise<void>
}

const SheetFooter: React.FC<SheetFooterProps> = ({ user, profile, handleSignOut }) => {
  return (
    <div className="flex items-center px-4 py-3">
      <Avatar className="mr-2 h-9 w-9">
        <AvatarImage src={`https://avatar.iran.liara.run/public/${user?.email}`} />
        <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="space-y-0.5">
        <p className="text-sm font-medium">{profile?.name || user?.email}</p>
        <p className="text-xs text-muted-foreground">{profile?.role || 'employee'}</p>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="ml-auto h-8 w-8 p-0">
            <span className="sr-only">Open user menu</span>
            <Settings className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[200px]">
          <DropdownMenuLabel>حسابي</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>تسجيل الخروج</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

export default AppSidebar;
