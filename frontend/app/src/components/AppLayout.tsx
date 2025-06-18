export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen w-screen bg-[#181920] flex flex-col justify-between">
      <header className="flex items-center justify-center text-zinc-400">
        <h1>Upload</h1>
      </header>

      <main className="w-screen h-screen p-4">{children}</main>

      <footer className="flex items-center justify-center text-zinc-400">
        © 2025 - Todos os direitos reservados
      </footer>
    </div>
  );
}
