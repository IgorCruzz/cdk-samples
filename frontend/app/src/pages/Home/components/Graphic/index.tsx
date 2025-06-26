import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function Graphic()  {  
  const data = [
    { name: 'Arquivos Completos', value: 120 },
    { name: 'Arquivos com Falhas', value: 30 },
  ];

 
  const COLORS = ['#4F46E5', '#EF4444'];  

  return (
    <div className="h-3/6"> 
      <Card className="h-full border border-[--border]">
        <CardHeader className="items-center justify-center">
          <CardTitle className="text-center">Statistic</CardTitle>
          <CardDescription className="text-center">
            View the statistics of your uploaded files.
          </CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col items-center justify-center" style={{ width: '100%', height: 300 }}>
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
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
