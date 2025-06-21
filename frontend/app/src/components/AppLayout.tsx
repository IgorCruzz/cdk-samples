import Logo from '@/assets/sheetparse-logo.png';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-screen w-screen bg-[#181920] flex flex-col justify-between">
      <header className="flex items-center justify-center text-zinc-400 bg-[#121314]">
        <img src={Logo} alt="SheetParse Logo" className="h-20 w-20 bg-transparent" />
      </header>

      <main className="w-screen h-screen p-4">{children}</main>

      <footer className="flex items-center justify-center text-zinc-400 bg-[#121314]">
        © 2025 - Todos os direitos reservados
      </footer>
    </div>
  );
}

export default AppLayout;