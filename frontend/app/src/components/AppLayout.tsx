import Logo from '@/assets/logo.png';

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
  <div className="min-h-screen flex flex-col justify-between">
  <div className="absolute top-0 left-0 w-full h-[4px] rounded-tl-4xl bg-gradient-to-r from-green-500 to-white z-10" />

  <header className="h-[100px] flex items-center justify-center bg-[oklch(15.823%_0.01178_260.646)] p-5">
    <img src={Logo} alt="Logo" height={100} width={100} />
  </header>

  <main className="flex-1 p-8 bg-gradient-to-r from-green-500 to-white">
    {children}
  </main>

  <footer className="h-[50px] flex items-center justify-center bg-[oklch(15.823%_0.01178_260.646)]">
    Igor Cruz
  </footer>
</div>

  );
};

export default AppLayout;
