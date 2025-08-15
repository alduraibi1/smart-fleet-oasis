
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemHealth {
  databaseConnected: boolean;
  realtimeConnected: boolean;
  lastChecked: Date | null;
  errors: string[];
}

export const useSystemHealth = () => {
  const [health, setHealth] = useState<SystemHealth>({
    databaseConnected: false,
    realtimeConnected: false,
    lastChecked: null,
    errors: []
  });

  const checkHealth = async () => {
    const errors: string[] = [];
    let databaseConnected = false;
    let realtimeConnected = false;

    try {
      // Test database connection
      const { data, error } = await supabase
        .from('vehicles')
        .select('id')
        .limit(1);
      
      if (!error) {
        databaseConnected = true;
      } else {
        errors.push(`Database connection error: ${error.message}`);
      }
    } catch (err) {
      errors.push(`Database connection failed: ${err}`);
    }

    try {
      // Test realtime connection
      const channel = supabase.channel('health-check');
      const subscription = channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          realtimeConnected = true;
        }
      });
      
      // Clean up after test
      setTimeout(() => {
        supabase.removeChannel(channel);
      }, 1000);
    } catch (err) {
      errors.push(`Realtime connection failed: ${err}`);
    }

    setHealth({
      databaseConnected,
      realtimeConnected,
      lastChecked: new Date(),
      errors
    });
  };

  useEffect(() => {
    checkHealth();
    
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  return {
    health,
    checkHealth,
    isHealthy: health.databaseConnected && health.errors.length === 0
  };
};
