
import { Upload, List } from './components';
 

export default function Mocks() { 
  return (
    <div className="flex flex-col gap-8">
        <div className="flex justify-end items-center">  
          <Upload /> 
        </div>

      <div className="w-full">
        <List />
      </div>
    </div>
  );
}
