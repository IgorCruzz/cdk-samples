import { Upload, History, Graphic } from './components';

export default function Home() { 
  return (
    <div className="flex flex-col gap-2 justify-center lg:flex-row">
      <div className="w-full lg:w-1/2 flex flex-col gap-2">
      <Upload />
      <Graphic />
      </div>
      <History />     
    </div>
  );
}
