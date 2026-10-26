import { AuthGuard } from "@/components/AuthGuard";

export default function FlowLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-frame">
      <AuthGuard>{children}</AuthGuard>
    </div>
  );
}
