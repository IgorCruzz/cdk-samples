import { Upload, History, Graphic } from './components';

export default function Home() { 
  return (
    <div className="flex w-full h-full gap-2 p-4">
      <div className="w-1/2 h-full bg-amber-300 flex flex-col gap-2">
      <Upload />
      <Graphic />
      </div>      

      <History />     
    </div>
  );
}
