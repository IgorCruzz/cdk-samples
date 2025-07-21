
import { List, AddOrUpdate } from './components'; 

export default function Users() { 
  return ( 
        <div className="flex flex-col gap-8">
          <div className="flex justify-end items-center">  
            <AddOrUpdate /> 
          </div>
    
          <div className="w-full">
            <List />
          </div>
        </div>
       
  );
}
