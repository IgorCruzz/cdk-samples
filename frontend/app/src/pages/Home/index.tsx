import { Upload, History } from './components';

export default function Home() { 
  return (
    <div className="flex w-full h-full gap-2 p-4">
      <Upload />
      <History />
    </div>
  );
}
