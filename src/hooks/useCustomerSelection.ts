import { useState, useCallback } from 'react';

export const useCustomerSelection = () => {
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);

  const handleSelectCustomer = useCallback((customerId: string) => {
    setSelectedCustomers(prev => {
      if (prev.includes(customerId)) {
        return prev.filter(id => id !== customerId);
      } else {
        return [...prev, customerId];
      }
    });
  }, []);

  const handleSelectAll = useCallback((checked: boolean, customerIds: string[]) => {
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
    handleSelectCustomer,
    handleSelectAll,
    clearSelection
  };
};