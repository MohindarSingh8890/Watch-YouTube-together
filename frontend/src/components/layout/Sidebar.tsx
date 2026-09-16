interface SidebarProps {
  children: React.ReactNode;
  isOpen?: boolean;
}

export default function Sidebar({ children, isOpen = true }: SidebarProps) {
  if (!isOpen) return null;

  return (
    <aside className="w-80 bg-surface-50 border-l border-zinc-800 flex flex-col h-full overflow-hidden">
      {children}
    </aside>
  );
}
