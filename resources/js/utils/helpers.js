export const formatDateToDisplay = (date) => {
  if (!date) return '';
  
  const dateObj = new Date(date);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true
  }).format(dateObj);
};

export const calculateCompletionRate = (total, pending) => {
  if (total <= 0) return 0;
  const completed = total - pending;
  return Math.round((completed / total) * 100);
};

export const getStatusBadgeProps = (status) => {
  if (status === 'completed') {
    return {
      variant: 'success',
      className: 'bg-green-100 text-green-800'
    };
  } else if (status === 'overdue') {
    return {
      variant: 'destructive',
      className: 'bg-red-100 text-red-800'
    };
  }
  return {
    variant: 'default',
    className: ''
  };
};


export const formatQuotationId = (id: number | null): string => {
  if (id === null) return 'DV0000';
  
  // Convert id to string and pad with leading zeros to ensure 4 digits
  const paddedId = id.toString().padStart(4, '0');
  return `DV${paddedId}`;
};