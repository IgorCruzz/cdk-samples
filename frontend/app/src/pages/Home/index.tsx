import { Upload, History, Graphic } from './components';

export default function Home() { 
  return (
    <div className="min-h-screen flex flex-col gap-8 lg:flex-row">
      <div className="flex flex-col w-full gap-8 lg:w-1/2">
        <Upload />
        <Graphic />
      </div>

      <div className="w-full lg:w-1/2">
        <History />
      </div>
    </div>
  );
}
