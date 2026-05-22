export default {
  mail: {
    mealWindow: {
      subject: 'Your meal selection window is open',
      body: 'The meal selection window is now open. Please log in to make your selections.',
    },
    changeRequest: {
      subject: 'Meal change request submitted',
      body: 'Your meal change request has been received and is pending review.',
    },
  },
  excel: {
    columns: {
      employeeName: 'Employee',
      meal: 'Meal',
      mealType: 'Meal type',
      date: 'Date',
    },
  },
} as const;
