
import { Upload, History, Graphic } from './components';
 

export default function File() { 
  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center"> 
        <Graphic />
        <Upload />
      </div>

      <div className="w-full">
        <History />
      </div>
    </div>
  );
}
