import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface LoginAttempt {
  timestamp: number;
  email: string;
}

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

// Deprecated: This hook is deprecated in favor of database-based tracking
// Use the new track-failed-login edge function instead
export function useLoginAttempts(email: string) {
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState(0);
  const [dbLocked, setDbLocked] = useState(false);

  const storageKey = `login_attempts_${email}`;

  // Load attempts from localStorage
  useEffect(() => {
    if (!email) return;
    
    const stored = localStorage.getItem(storageKey);
    if (stored) {
      try {
        const parsedAttempts: LoginAttempt[] = JSON.parse(stored);
        const now = Date.now();
        
        // Filter out old attempts
        const recentAttempts = parsedAttempts.filter(
          attempt => now - attempt.timestamp < ATTEMPT_WINDOW
        );
        
        setAttempts(recentAttempts);
        
        // Update localStorage with filtered attempts
        if (recentAttempts.length !== parsedAttempts.length) {
          localStorage.setItem(storageKey, JSON.stringify(recentAttempts));
        }
      } catch (error) {
        console.error('Error parsing login attempts:', error);
        localStorage.removeItem(storageKey);
      }
    }
  }, [email, storageKey]);

  // Check lockout status
  useEffect(() => {
    const now = Date.now();
    const recentAttempts = attempts.filter(
      attempt => now - attempt.timestamp < LOCKOUT_DURATION
    );

    if (recentAttempts.length >= MAX_ATTEMPTS) {
      const oldestAttempt = recentAttempts[0];
      const lockoutEnd = oldestAttempt.timestamp + LOCKOUT_DURATION;
      const timeRemaining = Math.max(0, lockoutEnd - now);
      
      setIsLocked(timeRemaining > 0);
      setLockoutTimeRemaining(Math.ceil(timeRemaining / 1000));
      
      // Set up timer to update remaining time
      if (timeRemaining > 0) {
        const timer = setInterval(() => {
          const currentTimeRemaining = Math.max(0, lockoutEnd - Date.now());
          setLockoutTimeRemaining(Math.ceil(currentTimeRemaining / 1000));
          
          if (currentTimeRemaining <= 0) {
            setIsLocked(false);
            clearInterval(timer);
          }
        }, 1000);
        
        return () => clearInterval(timer);
      }
    } else {
      setIsLocked(false);
      setLockoutTimeRemaining(0);
    }
  }, [attempts]);

  const addFailedAttempt = () => {
    if (!email) return;
    
    const newAttempt: LoginAttempt = {
      timestamp: Date.now(),
      email
    };
    
    const updatedAttempts = [...attempts, newAttempt];
    setAttempts(updatedAttempts);
    
    // Save to localStorage
    localStorage.setItem(storageKey, JSON.stringify(updatedAttempts));
  };

  const clearAttempts = () => {
    setAttempts([]);
    localStorage.removeItem(storageKey);
  };

  const getRemainingAttempts = () => {
    const now = Date.now();
    const recentAttempts = attempts.filter(
      attempt => now - attempt.timestamp < ATTEMPT_WINDOW
    );
    return Math.max(0, MAX_ATTEMPTS - recentAttempts.length);
  };

  return {
    isLocked,
    lockoutTimeRemaining,
    remainingAttempts: getRemainingAttempts(),
    addFailedAttempt,
    clearAttempts
  };
}