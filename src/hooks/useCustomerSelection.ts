
import { useState, useCallback } from 'react';

export const useCustomerSelection = () => {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const toggleCustomer = useCallback((customerId: string) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  }, []);

  const toggleAll = useCallback((checked: boolean, customerIds: string[]) => {
    if (checked) {
      setSelectedCustomers(customerIds);
    } else {
      setSelectedCustomers([]);
    }
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedCustomers([]);
  }, []);

  return {
    selectedCustomers,
    toggleCustomer,
    toggleAll,
    clearSelection
  };
};
