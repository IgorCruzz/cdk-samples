import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Graphic()  {  
  const data = [
    { name: 'Arquivos Completos', value: 120 },
    { name: 'Arquivos com Falhas', value: 30 },
  ];

 
  const COLORS = ['#4F46E5', '#EF4444'];  

  return ( 
      <Card className="h-8/12  rounded-tl-4xl rounded-br-4xl">
        <CardHeader className="text-center">
          <CardTitle>Statistic</CardTitle>
          <CardDescription >
            View the statistics of your uploaded files.
          </CardDescription>
        </CardHeader>

        <CardContent className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={10} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card> 
  );
}
