import Logo from '@/assets/sheetparse-logo.png';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="w-screen h-screen flex flex-col justify-between">
      <header className="w-full flex justify-center items-center bg-[--primary]">
        <img src={Logo} alt="SheetParse Logo" className="h-20 w-20 bg-transparent" />
      </header>

      <main className="h-full">{children}</main>

      <footer className="text-center">
        © 2025 - Todos os direitos reservados
      </footer>
    </div>
  );
};

export default AppLayout;
