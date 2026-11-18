export const activities = {
  cinema: { label: "Cinema", heading: "Which <em>film?</em>", detail: "Film title" },
  food: {
    label: "Food", heading: "What are you <em>craving?</em>", detail: "Cuisine",
    cards: [
      ["Azerbaijani", "🍚"],
      ["Turkish", "🥙"],
      ["Georgian", "🥟"],
      ["Italian", "🍝"],
      ["Japanese", "🍣"],
      ["Indian", "🍛"],
      ["Asian", "🍜"],
    ],
  },
  coffee: {
    label: "Coffee", heading: "Where should we <em>go?</em>", detail: "Coffee shop",
    cards: [
      ["42 Coffee Roasters", "☕", "41 Xaqani Street"],
      ["Baku Coffee Factory", "☕", "Nizami Street"],
      ["Baku Roasting Company", "☕", "12 Ələsgər Ələkbərov Street"],
      ["Belgian Coffee & Chocolate", "☕", "Sahil"],
      ["Bourbon Coffee", "☕", "28 Mall"],
      ["Breezy Coffee Shop", "☕", "50B Süleyman Rəhimov Street"],
      ["Chaplin House Coffee", "☕", "71 İstiqlaliyyət Street"],
      ["Coffee Domingo", "☕", "1 Yaşıl Ada Street"],
      ["Coffee Moffie", "☕", "9 İslam Səfərli Street"],
      ["CoffeeLea", "☕", "Statistika"],
      ["COFFEELAB", "☕", "Tabriz Street"],
      ["Coffeemania", "☕", "Deniz Mall"],
      ["Cofferica Roasters", "☕", "Near Heydar Aliyev Center"],
      ["Cofiesto", "☕", "3A Rixard Zorge Street"],
      ["Costa Coffee", "☕", "Nargiz Mall"],
      ["CupCup Coffee", "☕", "Port Baku Walk"],
      ["Fika Coffee Culture", "☕", "8 Abbas Zamanov Street"],
      ["Fine Cup Roasters", "☕", "3 Şeyx Şamil Street"],
      ["Gloria Jean’s Coffees", "☕", "Port Baku Mall"],
      ["Hola Coffee", "☕", "203 Nizami Street"],
      ["Milk Lab", "☕", "5 Mərkəzi Bulvar Street"],
      ["Moka Roastery & Eatery", "☕", "37 Füzuli Street"],
      ["Nika Coffee", "☕", "4/1 Nazim Hajiyev Street"],
      ["Nomad Bakery", "☕", "White City"],
      ["Old City Coffee", "☕", "İçərişəhər"],
      ["Organica Bakery & Coffee", "☕", "5B Fikrət Əmirov Street"],
      ["Second Cup", "☕", "Resulzade"],
      ["Starbucks", "☕", "Port Baku Mall"],
      ["Traveler’s Coffee", "☕", "37 Bülbül Avenue"],
      ["United Coffee Beans", "☕", "Center"],
    ],
  },
};

export function formatDate(date) {
  return new Intl.DateTimeFormat("en", { dateStyle: "full", timeZone: "UTC" })
    .format(new Date(date + "T00:00:00Z"));
}

export function todayInBaku() {
  const parts = new Intl.DateTimeFormat("en", {
    timeZone: "Asia/Baku", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts();
  const part = (type) => parts.find((item) => item.type === type).value;
  return [part("year"), part("month"), part("day")].join("-");
}
