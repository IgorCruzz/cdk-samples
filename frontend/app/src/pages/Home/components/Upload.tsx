import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card" 

export function Upload() { 
  return ( 
    <div className="w-1/2"> 
      <Card>
      <CardHeader className="item-center justify-center">
        <CardTitle className="text-center">Upload a File</CardTitle>
        <CardDescription>Select a file to upload and click the submit button.</CardDescription>
      </CardHeader>
      </Card>    
    </div>
  )
}

 