
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LucideIcon, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { useNavigate } from 'react-router-dom';

interface InteractiveKPICardProps {
  title: string;
  value: string | number;
  change?: string;
  trend?: 'up' | 'down';
  icon: LucideIcon;
  color: string;
  linkTo?: string;
  progress?: number;
  target?: string;
}

export const InteractiveKPICard: React.FC<InteractiveKPICardProps> = ({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
  linkTo,
  progress,
  target
}) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    if (linkTo) {
      navigate(linkTo);
    }
  };

  return (
    <Card className={`hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-[1.02] ${linkTo ? 'group' : ''}`}>
      <CardContent className="p-6" onClick={handleCardClick}>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-2">
              {title}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold">{value}</p>
              {change && (
                <div className={`flex items-center text-sm ${
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 mr-1" />
                  ) : (
                    <TrendingDown className="w-4 h-4 mr-1" />
                  )}
                  {change}
                </div>
              )}
            </div>
            
            {progress !== undefined && (
              <div className="mt-3">
                <Progress value={progress} className="h-2" />
                {target && (
                  <p className="text-xs text-muted-foreground mt-1">
                    الهدف: {target}
                  </p>
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <div className={`p-2 rounded-lg ${color}`}>
              <Icon className="h-6 w-6" />
            </div>
            
            {linkTo && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
