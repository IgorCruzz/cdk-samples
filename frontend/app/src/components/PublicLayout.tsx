import Logo from '@/assets/logo.png';

const PublicLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen flex flex-col justify-between">
      

      <main className="flex-1 flex flex-row">
        <div className="flex items-center justify-center w-1/2">
          <img src={Logo} alt="Logo" height={460} width={460} />
        </div>
        <div className="flex items-center justify-center w-1/2">
          {children}
        </div>
      </main>
    </div>
  );
};

export default PublicLayout;
