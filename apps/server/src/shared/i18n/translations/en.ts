export default {
  mail: {
    mealWindow: {
      subject: 'Your meal selection window is open',
      body: 'The meal selection window is now open. Please log in to make your selections.',
    },
    changeRequest: {
      submitted: {
        subject: 'Meal change request submitted',
        body: 'Your meal change request has been received and is pending review.',
      },
      approved: {
        subject: 'Your change request has been approved',
        body: 'Your change request has been approved.',
      },
      rejected: {
        subject: 'Your change request has been rejected',
        body: 'Your change request has been rejected.',
      },
      bulkProcessed: {
        subject: 'Your change requests have been processed',
        intro: 'Your change requests have been processed:',
        approved: 'Approved: {{count}} request(s)',
        rejected: 'Rejected: {{count}} request(s)',
      },
    },
    invite: {
      subject: "You've been invited to join your team",
      heading: "You've been invited!",
      body: "You've been invited to join your team. Click the button below to set up your account.",
      button: 'Accept Invitation',
      footer: 'This link expires in 7 days. If you did not expect this invitation, you can safely ignore this email.',
    },
    orderSummary: {
      subject: 'Order summary for your meals',
      subjectAdjusted: 'Adjusted order summary for your meals',
      intro: 'Dear Sir/Madam, please find the order summary below.',
      introAdjusted: 'This is an adjusted version of a previously sent order summary. The quantities below reflect the latest approved change requests.',
      noOrders: 'No orders for this window.',
      table: {
        date: 'Date',
        meal: 'Meal',
        qty: 'Qty',
      },
    },
  },
  excel: {
    columns: {
      employeeName: 'Employee',
      meal: 'Meal',
      mealType: 'Meal type',
      date: 'Date',
      qty: 'Qty',
      soup: 'Soup',
      bread: 'Bread',
      dessert: 'Dessert',
    },
    daySheet: {
      yes: 'Yes',
      no: 'No',
    },
    mealTypes: {
      breakfast: 'Breakfasts',
      lunch: 'Lunches',
      dinner: 'Dinners',
      bread: 'Breads',
      soup: 'Soups',
      salad: 'Salads',
      dessert: 'Desserts',
    },
  },
} as const;
