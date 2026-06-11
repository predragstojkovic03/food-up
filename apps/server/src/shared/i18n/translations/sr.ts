import type en from './en';

type StringValues<T> = {
  [K in keyof T]: T[K] extends string ? string : StringValues<T[K]>;
};

const sr: StringValues<typeof en> = {
  mail: {
    mealWindow: {
      subject: 'Vaš prozor za izbor obroka je otvoren',
      body: 'Prozor za izbor obroka je sada otvoren. Prijavite se da biste napravili izbor.',
    },
    changeRequest: {
      submitted: {
        subject: 'Zahtev za promenu obroka podnet',
        body: 'Vaš zahtev za promenu obroka je primljen i čeka na pregled.',
      },
      approved: {
        subject: 'Vaš zahtev za promenu je odobren',
        body: 'Vaš zahtev za promenu je odobren.',
      },
      rejected: {
        subject: 'Vaš zahtev za promenu je odbijen',
        body: 'Vaš zahtev za promenu je odbijen.',
      },
      bulkProcessed: {
        subject: 'Vaši zahtevi za promenu su obrađeni',
        intro: 'Vaši zahtevi za promenu su obrađeni:',
        approved: 'Odobrenо: {{count}} zahtev(a)',
        rejected: 'Odbijeno: {{count}} zahtev(a)',
      },
    },
    invite: {
      subject: 'Pozvani ste da se pridružite svom timu',
      heading: 'Pozvani ste!',
      body: 'Pozvani ste da se pridružite svom timu. Kliknite na dugme ispod da podesite nalog.',
      button: 'Prihvati poziv',
      footer: 'Ovaj link ističe za 7 dana. Ako niste očekivali ovaj poziv, možete ga ignorisati.',
    },
    orderSummary: {
      subject: 'Pregled narudžbine za vaše obroke',
      subjectAdjusted: 'Ažurirani pregled narudžbine za vaše obroke',
      intro: 'Poštovani, u nastavku mejla nalazi se pregled narudžbina.',
      introAdjusted:
        'Ovo je ažurirana verzija prethodno poslatog pregleda narudžbine. Količine u nastavku odražavaju poslednje odobrene zahteve za promenu.',
      noOrders: 'Nema narudžbina za ovaj prozor.',
      table: {
        date: 'Datum',
        meal: 'Obrok',
        qty: 'Kol.',
      },
    },
  },
  excel: {
    columns: {
      employeeName: 'Zaposleni',
      meal: 'Obrok',
      mealType: 'Vrsta obroka',
      date: 'Datum',
      qty: 'Kol.',
      soup: 'Čorba',
      bread: 'Hleb',
      dessert: 'Desert',
    },
    daySheet: {
      yes: 'Da',
      no: 'Ne',
    },
    mealTypes: {
      breakfast: 'Doručci',
      lunch: 'Ručkovi',
      dinner: 'Večere',
      bread: 'Hleb',
      soup: 'Supe',
      salad: 'Salate',
      dessert: 'Deserti',
    },
  },
};

export default sr;
