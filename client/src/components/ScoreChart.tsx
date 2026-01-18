import { ResponsiveContainer, RadialBarChart, RadialBar, PolarAngleAxis } from "recharts";
import { motion } from "framer-motion";

interface ScoreChartProps {
  score: number;
}

export function ScoreChart({ score }: ScoreChartProps) {
  // Determine color based on score
  let fill = "hsl(var(--primary))";
  let textClass = "text-primary";
  
  if (score < 50) {
    fill = "#ef4444"; // red-500
    textClass = "text-red-500";
  } else if (score < 80) {
    fill = "#f59e0b"; // amber-500
    textClass = "text-amber-500";
  } else {
    fill = "#22c55e"; // green-500
    textClass = "text-green-500";
  }

  const data = [
    {
      name: "Score",
      value: score,
      fill: fill,
    },
  ];

  return (
    <div className="relative w-full h-[250px] flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          innerRadius="70%"
          outerRadius="100%"
          barSize={20}
          data={data}
          startAngle={90}
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background
            dataKey="value"
            cornerRadius={30}
            fill={fill}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <motion.div 
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-center"
        >
          <span className={`text-5xl font-bold font-display block ${textClass}`}>
            {score}
          </span>
          <span className="text-sm font-medium text-muted-foreground uppercase tracking-widest mt-1">
            ATS Score
          </span>
        </motion.div>
      </div>
    </div>
  );
}
