const sr = {
  mail: {
    mealWindow: {
      subject: 'Vaš prozor za izbor obroka je otvoren',
      body: 'Prozor za izbor obroka je sada otvoren. Prijavite se da biste napravili izbor.',
    },
    changeRequest: {
      subject: 'Zahtev za promenu obroka podnet',
      body: 'Vaš zahtev za promenu obroka je primljen i čeka na pregled.',
    },
  },
  excel: {
    columns: {
      employeeName: 'Zaposleni',
      meal: 'Obrok',
      mealType: 'Vrsta obroka',
      date: 'Datum',
    },
  },
} as const;

export default sr;
