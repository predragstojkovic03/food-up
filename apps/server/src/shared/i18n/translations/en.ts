export type Translations = {
  mail: {
    mealWindow: {
      subject: string;
      body: string;
    };
    changeRequest: {
      subject: string;
      body: string;
    };
  };
  excel: {
    columns: {
      employeeName: string;
      meal: string;
      mealType: string;
      date: string;
    };
  };
};

const en: Translations = {
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
};

export default en;
