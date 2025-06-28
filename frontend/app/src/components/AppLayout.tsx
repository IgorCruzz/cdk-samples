import Logo from '@/assets/logo.png';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
  <div className="min-h-screen flex flex-col justify-between">
  <header className="h-[50px] flex items-center justify-center bg-[oklch(15.823%_0.01178_260.646)] p-5">
    <img src={Logo} alt="Logo" height={80} width={80} />
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
