import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-6 p-8">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold text-primary animate-bounce-in">404</h1>
          <h2 className="text-2xl font-semibold text-foreground">الصفحة غير موجودة</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            عذراً، الصفحة التي تبحث عنها غير موجودة أو تم نقلها إلى مكان آخر
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild variant="default" size="lg" className="gap-2">
            <Link to="/">
              <Home className="w-4 h-4" />
              العودة للرئيسية
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/vehicles">
              عرض المركبات
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
