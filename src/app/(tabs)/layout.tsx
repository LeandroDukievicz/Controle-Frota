import { AuthGuard } from "@/components/AuthGuard";
import { BottomNav } from "@/components/BottomNav";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-frame">
      <AuthGuard>
        {children}
        <BottomNav />
      </AuthGuard>
    </div>
  );
}
