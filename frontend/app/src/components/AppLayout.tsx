
const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
  <div className="min-h-screen flex flex-col justify-between">
  <header className="h-[100px] flex items-center justify-center">
    <p>SHEET PARSE</p>
  </header>

  <main className="flex-1 p-8">
    {children}
  </main>

  <footer className="h-[100px] flex items-center justify-center">
    Igor Cruz
  </footer>
</div>

  );
};

export default AppLayout;
