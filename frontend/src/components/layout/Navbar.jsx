import { LogOut, User } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { Button } from '../ui/Button';

const Navbar = () => {
  const { authUser, logout } = useAuthStore();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center">
        {/* Mobile menu button could go here */}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20 text-primary">
            <User size={18} />
          </div>
          <div className="text-sm">
            <p className="font-medium leading-none">{authUser?.name}</p>
            <p className="text-xs text-muted-foreground">{authUser?.role}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={() => logout()} title="Logout">
          <LogOut size={20} />
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
