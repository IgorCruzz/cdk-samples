import Logo from '@/assets/logo.png';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
  <div className="min-h-screen flex flex-col justify-between">
  <div className="absolute top-0 left-0 w-full h-[4px] rounded-tl-4xl bg-gradient-to-r from-green-500 to-white z-10" />

  <header className="h-[80px] flex items-center justify-between px-6 bg-gradient-to-r from-green-500 to-blue-500">
        <img src={Logo} alt="Logo" height={60} width={60} />
        <span className="text-white font-bold">Bem-vindo</span>
  </header>

  <main className="flex-1 p-8">
    {children}
  </main>

  <footer className="h-[50px] flex items-center justify-center bg-[oklch(15.823%_0.01178_260.646)]">
    Igor Cruz
  </footer>
</div>

  );
};

export default AppLayout;
