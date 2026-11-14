// Names, UI strings and interpretation text in English and Hindi.

export const SIGNS = {
  en: ['Aries (Mesha)', 'Taurus (Vrishabha)', 'Gemini (Mithuna)', 'Cancer (Karka)', 'Leo (Simha)', 'Virgo (Kanya)',
    'Libra (Tula)', 'Scorpio (Vrishchika)', 'Sagittarius (Dhanu)', 'Capricorn (Makara)', 'Aquarius (Kumbha)', 'Pisces (Meena)'],
  hi: ['मेष', 'वृषभ', 'मिथुन', 'कर्क', 'सिंह', 'कन्या', 'तुला', 'वृश्चिक', 'धनु', 'मकर', 'कुंभ', 'मीन'],
};
export const SIGN_SHORT = {
  en: ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces'],
  hi: SIGNS.hi,
};
export const SIGN_GLYPHS = ['♈', '♉', '♊', '♋', '♌', '♍', '♎', '♏', '♐', '♑', '♒', '♓'];

export const PLANET_NAMES = {
  en: { Sun: 'Sun', Moon: 'Moon', Mars: 'Mars', Mercury: 'Mercury', Jupiter: 'Jupiter', Venus: 'Venus', Saturn: 'Saturn', Rahu: 'Rahu', Ketu: 'Ketu' },
  hi: { Sun: 'सूर्य', Moon: 'चंद्र', Mars: 'मंगल', Mercury: 'बुध', Jupiter: 'गुरु', Venus: 'शुक्र', Saturn: 'शनि', Rahu: 'राहु', Ketu: 'केतु' },
};
export const PLANET_ABBR = {
  en: { Sun: 'Su', Moon: 'Mo', Mars: 'Ma', Mercury: 'Me', Jupiter: 'Ju', Venus: 'Ve', Saturn: 'Sa', Rahu: 'Ra', Ketu: 'Ke' },
  hi: { Sun: 'सू', Moon: 'चं', Mars: 'मं', Mercury: 'बु', Jupiter: 'गु', Venus: 'शु', Saturn: 'श', Rahu: 'रा', Ketu: 'के' },
};

export const NAKSHATRAS = {
  en: ['Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha', 'Magha',
    'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Mula',
    'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'],
  hi: ['अश्विनी', 'भरणी', 'कृत्तिका', 'रोहिणी', 'मृगशिरा', 'आर्द्रा', 'पुनर्वसु', 'पुष्य', 'आश्लेषा', 'मघा',
    'पूर्वा फाल्गुनी', 'उत्तरा फाल्गुनी', 'हस्त', 'चित्रा', 'स्वाति', 'विशाखा', 'अनुराधा', 'ज्येष्ठा', 'मूल',
    'पूर्वाषाढ़ा', 'उत्तराषाढ़ा', 'श्रवण', 'धनिष्ठा', 'शतभिषा', 'पूर्वा भाद्रपद', 'उत्तरा भाद्रपद', 'रेवती'],
};
const TITHI_BASE = {
  en: ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami',
    'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi'],
  hi: ['प्रतिपदा', 'द्वितीया', 'तृतीया', 'चतुर्थी', 'पंचमी', 'षष्ठी', 'सप्तमी', 'अष्टमी', 'नवमी', 'दशमी', 'एकादशी',
    'द्वादशी', 'त्रयोदशी', 'चतुर्दशी'],
};
export function tithiName(i, lang) {
  if (i === 14) return lang === 'hi' ? 'पूर्णिमा' : 'Purnima';
  if (i === 29) return lang === 'hi' ? 'अमावस्या' : 'Amavasya';
  const paksha = i < 15 ? (lang === 'hi' ? 'शुक्ल' : 'Shukla') : (lang === 'hi' ? 'कृष्ण' : 'Krishna');
  return `${paksha} ${TITHI_BASE[lang][i % 15]}`;
}
export const YOGAS = {
  en: ['Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda',
    'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana', 'Vajra', 'Siddhi', 'Vyatipata', 'Variyan', 'Parigha', 'Shiva',
    'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'],
  hi: ['विष्कम्भ', 'प्रीति', 'आयुष्मान', 'सौभाग्य', 'शोभन', 'अतिगण्ड', 'सुकर्मा', 'धृति', 'शूल', 'गण्ड', 'वृद्धि',
    'ध्रुव', 'व्याघात', 'हर्षण', 'वज्र', 'सिद्धि', 'व्यतीपात', 'वरीयान', 'परिघ', 'शिव', 'सिद्ध', 'साध्य', 'शुभ',
    'शुक्ल', 'ब्रह्म', 'इन्द्र', 'वैधृति'],
};
export const KARANAS = {
  en: ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Garaja', 'Vanija', 'Vishti (Bhadra)', 'Shakuni', 'Chatushpada', 'Naga', 'Kimstughna'],
  hi: ['बव', 'बालव', 'कौलव', 'तैतिल', 'गर', 'वणिज', 'विष्टि (भद्रा)', 'शकुनि', 'चतुष्पद', 'नाग', 'किंस्तुघ्न'],
};
export const WEEKDAYS = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  hi: ['रविवार', 'सोमवार', 'मंगलवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'],
};
export const WEEKDAYS_SHORT = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  hi: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
};
export const ORDINAL = {
  en: (n) => n + ({ 1: 'st', 2: 'nd', 3: 'rd' }[n] || 'th'),
  hi: (n) => ['पहले', 'दूसरे', 'तीसरे', 'चौथे', 'पाँचवें', 'छठे', 'सातवें', 'आठवें', 'नौवें', 'दसवें', 'ग्यारहवें', 'बारहवें'][n - 1],
};

export const UI = {
  en: {
    appName: 'Astro Turf', tagline: 'Vedic astrology · Lagna-wise weekly rashifal',
    navHome: 'Home', navWeekly: 'Weekly', navKundli: 'Kundli', navPanchang: 'Panchang', navEditor: 'Editor',
    weeklyTitle: 'Lagna-wise Weekly Rashifal', chooseLagna: 'Choose your Lagna (Ascendant)',
    dontKnow: "Don't know your Lagna? Find it from your birth details", prevWeek: '← Previous week', nextWeek: 'Next week →',
    thisWeek: 'This week', overview: 'Overview', career: 'Career & Work', finance: 'Money & Finance',
    love: 'Love, Marriage & Family', health: 'Health', dayByDay: 'Day-by-day guide', transits: 'Planet transits from your Lagna',
    lucky: 'Lucky this week', luckyNumber: 'Lucky number', luckyColour: 'Lucky colour', luckyDay: 'Best day',
    remedy: 'Remedy (Upay)', events: 'Key planetary events this week', none: 'No sign changes this week.',
    astroNote: "Astrologer's weekly note", astroNoteSrc: 'Source', house: 'House', planet: 'Planet', sign: 'Sign',
    degree: 'Degree', nakshatra: 'Nakshatra', retro: 'R', retroFull: 'Retrograde', good: 'Favourable', caution: 'Be careful',
    neutral: 'Mixed', myLagna: 'My Lagna', setMyLagna: 'Save as my Lagna', saved: 'Saved',
    kundliTitle: 'Free Kundli (Birth Chart)', name: 'Name', dob: 'Date of birth', tob: 'Time of birth', place: 'Place of birth',
    lat: 'Latitude', lon: 'Longitude', tz: 'UTC offset (hours)', custom: 'Custom location…', generate: 'Generate Kundli',
    yourLagna: 'Your Lagna (Ascendant)', moonSign: 'Moon sign (Rashi)', sunSign: 'Sun sign', birthStar: 'Birth Nakshatra',
    lagnaChart: 'Lagna chart (North Indian)', planetTable: 'Planetary positions', seeWeekly: 'Read this week’s rashifal for',
    panchangTitle: 'Panchang', date: 'Date', tithi: 'Tithi', yoga: 'Yoga', karana: 'Karana', vara: 'Vara (Day)',
    sunrise: 'Sunrise', sunset: 'Sunset', rahuKaal: 'Rahu Kaal', moonIn: 'Moon in', sunIn: 'Sun in', today: 'Today',
    editorTitle: 'Weekly prediction editor',
    editorHelp: 'Add the reference astrologer’s lagna-wise weekly prediction (for example, notes from a weekly video you follow). It is shown alongside the calculated rashifal for that week. Saved in this browser; export the JSON to publish it for everyone at data/weekly/<monday-date>.json.',
    week: 'Week starting (Monday)', lagna: 'Lagna', textEn: 'Prediction (English)', textHi: 'Prediction (Hindi)',
    sourceLabel: 'Source / credit (e.g. channel name and video link)', save: 'Save', export: 'Export JSON', import: 'Import JSON',
    clear: 'Clear this week', savedOk: 'Saved for this week.', imported: 'Imported.', calculated: 'Calculated from the week’s transits',
    disclaimer: 'Astrology is a traditional belief system. Predictions here are generated from planetary positions for guidance and entertainment and are not professional advice.',
    quickWeekly: 'This week for every Lagna', panchangToday: 'Today’s Panchang', findLagna: 'Find my Lagna', open: 'Open',
    install: 'Install app', language: 'हिन्दी', stars: 'Rating', week_of: 'Week', days: 'Days', moonHouse: 'Moon in house',
  },
  hi: {
    appName: 'एस्ट्रो टर्फ', tagline: 'वैदिक ज्योतिष · लग्न अनुसार साप्ताहिक राशिफल',
    navHome: 'होम', navWeekly: 'साप्ताहिक', navKundli: 'कुंडली', navPanchang: 'पंचांग', navEditor: 'संपादक',
    weeklyTitle: 'लग्न अनुसार साप्ताहिक राशिफल', chooseLagna: 'अपना लग्न चुनें',
    dontKnow: 'अपना लग्न नहीं पता? जन्म विवरण से जानें', prevWeek: '← पिछला सप्ताह', nextWeek: 'अगला सप्ताह →',
    thisWeek: 'यह सप्ताह', overview: 'सारांश', career: 'करियर व कार्यक्षेत्र', finance: 'धन व आर्थिक स्थिति',
    love: 'प्रेम, विवाह व परिवार', health: 'स्वास्थ्य', dayByDay: 'दिन-प्रतिदिन', transits: 'आपके लग्न से ग्रह गोचर',
    lucky: 'इस सप्ताह शुभ', luckyNumber: 'शुभ अंक', luckyColour: 'शुभ रंग', luckyDay: 'शुभ दिन',
    remedy: 'उपाय', events: 'इस सप्ताह की प्रमुख ग्रह घटनाएँ', none: 'इस सप्ताह कोई राशि परिवर्तन नहीं।',
    astroNote: 'ज्योतिषी की साप्ताहिक टिप्पणी', astroNoteSrc: 'स्रोत', house: 'भाव', planet: 'ग्रह', sign: 'राशि',
    degree: 'अंश', nakshatra: 'नक्षत्र', retro: 'व', retroFull: 'वक्री', good: 'शुभ', caution: 'सावधान',
    neutral: 'मिश्रित', myLagna: 'मेरा लग्न', setMyLagna: 'मेरा लग्न सहेजें', saved: 'सहेजा गया',
    kundliTitle: 'निःशुल्क कुंडली', name: 'नाम', dob: 'जन्म तिथि', tob: 'जन्म समय', place: 'जन्म स्थान',
    lat: 'अक्षांश', lon: 'देशांतर', tz: 'UTC अंतर (घंटे)', custom: 'अन्य स्थान…', generate: 'कुंडली बनाएँ',
    yourLagna: 'आपका लग्न', moonSign: 'चंद्र राशि', sunSign: 'सूर्य राशि', birthStar: 'जन्म नक्षत्र',
    lagnaChart: 'लग्न कुंडली (उत्तर भारतीय)', planetTable: 'ग्रह स्थिति', seeWeekly: 'इस सप्ताह का राशिफल पढ़ें —',
    panchangTitle: 'पंचांग', date: 'तिथि (दिनांक)', tithi: 'तिथि', yoga: 'योग', karana: 'करण', vara: 'वार',
    sunrise: 'सूर्योदय', sunset: 'सूर्यास्त', rahuKaal: 'राहु काल', moonIn: 'चंद्रमा', sunIn: 'सूर्य', today: 'आज',
    editorTitle: 'साप्ताहिक भविष्यफल संपादक',
    editorHelp: 'संदर्भ ज्योतिषी का लग्न अनुसार साप्ताहिक भविष्यफल यहाँ जोड़ें (जैसे आप जिनका साप्ताहिक वीडियो देखते हैं, उसके नोट्स)। यह उस सप्ताह के गणना आधारित राशिफल के साथ दिखेगा। यह इस ब्राउज़र में सहेजा जाता है; सभी के लिए प्रकाशित करने हेतु JSON को data/weekly/<सोमवार-दिनांक>.json में रखें।',
    week: 'सप्ताह आरंभ (सोमवार)', lagna: 'लग्न', textEn: 'भविष्यफल (अंग्रेज़ी)', textHi: 'भविष्यफल (हिन्दी)',
    sourceLabel: 'स्रोत / श्रेय (जैसे चैनल का नाम व वीडियो लिंक)', save: 'सहेजें', export: 'JSON निर्यात', import: 'JSON आयात',
    clear: 'यह सप्ताह मिटाएँ', savedOk: 'इस सप्ताह के लिए सहेजा गया।', imported: 'आयात हुआ।', calculated: 'सप्ताह के गोचर से गणना',
    disclaimer: 'ज्योतिष एक पारंपरिक मान्यता है। यहाँ का भविष्यफल ग्रह स्थिति से मार्गदर्शन व मनोरंजन हेतु बनाया गया है, यह पेशेवर सलाह नहीं है।',
    quickWeekly: 'इस सप्ताह — सभी लग्न', panchangToday: 'आज का पंचांग', findLagna: 'मेरा लग्न जानें', open: 'खोलें',
    install: 'ऐप इंस्टॉल करें', language: 'English', stars: 'रेटिंग', week_of: 'सप्ताह', days: 'दिन', moonHouse: 'चंद्रमा भाव',
  },
};

// Domains of the 12 houses (bhava)
export const HOUSE_DOMAIN = {
  en: ['self, body and confidence', 'family, savings and speech', 'courage, siblings and short travel',
    'home, mother and peace of mind', 'children, intellect and romance', 'enemies, debts, health issues and competition',
    'spouse, partnerships and business deals', 'sudden events, research and hidden matters', 'luck, father, dharma and long journeys',
    'career, status and reputation', 'income, gains and friends', 'expenses, foreign lands and rest'],
  hi: ['स्वयं, शरीर व आत्मविश्वास', 'परिवार, बचत व वाणी', 'पराक्रम, भाई-बहन व छोटी यात्राएँ', 'घर, माता व मानसिक शांति',
    'संतान, बुद्धि व प्रेम', 'शत्रु, ऋण, रोग व प्रतियोगिता', 'जीवनसाथी, साझेदारी व व्यापारिक सौदे', 'अचानक घटनाएँ, शोध व गुप्त विषय',
    'भाग्य, पिता, धर्म व लंबी यात्राएँ', 'करियर, पद व प्रतिष्ठा', 'आय, लाभ व मित्र', 'व्यय, विदेश व विश्राम'],
};

// Result sentences per house when a transit is supportive / challenging
export const HOUSE_RESULT = {
  en: {
    good: ['You feel energetic and self-assured; a good time to take initiative.',
      'Family support and savings improve; your words carry weight.',
      'Bold efforts pay off; siblings and colleagues cooperate.',
      'Domestic comfort grows; property or vehicle matters can move forward.',
      'Creative ideas flow; good news related to children or studies is possible.',
      'You overcome rivals and pending problems; old debts or ailments ease.',
      'Partnerships and marriage-related matters progress smoothly.',
      'Unexpected help or hidden gains; research and inner work go well.',
      'Luck supports you; blessings of elders and spiritual progress.',
      'Professional growth, recognition from seniors and new responsibilities.',
      'Income rises and wishes get fulfilled; social circle expands.',
      'Expenses are on good causes; travel or rest brings relief.'],
    bad: ['Fatigue or ego clashes are possible; avoid impulsive decisions.',
      'Watch your words in the family and control unnecessary spending.',
      'Efforts may feel scattered; avoid risky ventures this week.',
      'Restlessness at home; take care of your mother’s health and your peace of mind.',
      'Avoid speculation; children’s matters or studies need extra attention.',
      'Stay alert to hidden rivals and minor health issues; do not lend money.',
      'Misunderstandings with spouse or partners are possible; be patient in deals.',
      'Sudden obstacles or worries; drive carefully and avoid risky investments.',
      'Luck may feel delayed; avoid arguments with elders or mentors.',
      'Pressure at work increases; avoid conflicts with seniors.',
      'Gains may be delayed; choose friends and investments carefully.',
      'Expenses and sleep disturbances can rise; avoid unnecessary travel.'],
  },
  hi: {
    good: ['ऊर्जा व आत्मविश्वास बढ़ेगा; नई पहल के लिए अच्छा समय है।',
      'परिवार का सहयोग मिलेगा व बचत बढ़ेगी; आपकी बात का प्रभाव रहेगा।',
      'साहसिक प्रयास सफल होंगे; भाई-बहन व सहकर्मी साथ देंगे।',
      'घरेलू सुख बढ़ेगा; भूमि-भवन या वाहन के कार्य आगे बढ़ सकते हैं।',
      'रचनात्मक विचार आएँगे; संतान या पढ़ाई से शुभ समाचार संभव है।',
      'विरोधियों व पुरानी समस्याओं पर विजय; ऋण या रोग में राहत।',
      'साझेदारी व विवाह संबंधी कार्य सहजता से आगे बढ़ेंगे।',
      'अप्रत्याशित सहायता या गुप्त लाभ; शोध व आध्यात्मिक कार्य अच्छे रहेंगे।',
      'भाग्य का साथ मिलेगा; बड़ों का आशीर्वाद व धार्मिक उन्नति।',
      'कार्यक्षेत्र में उन्नति, वरिष्ठों से प्रशंसा व नई ज़िम्मेदारियाँ।',
      'आय बढ़ेगी व इच्छाएँ पूरी होंगी; मित्र मंडली बढ़ेगी।',
      'खर्च शुभ कार्यों पर होगा; यात्रा या विश्राम से राहत मिलेगी।'],
    bad: ['थकान या अहंकार के टकराव संभव; जल्दबाज़ी में निर्णय न लें।',
      'परिवार में वाणी पर संयम रखें और अनावश्यक खर्च रोकें।',
      'प्रयास बिखरे हुए लग सकते हैं; इस सप्ताह जोखिम भरे काम टालें।',
      'घर में अशांति रह सकती है; माता के स्वास्थ्य व मन की शांति का ध्यान रखें।',
      'सट्टा-जुआ से बचें; संतान या पढ़ाई पर अधिक ध्यान दें।',
      'गुप्त शत्रुओं व छोटी स्वास्थ्य समस्याओं से सावधान; उधार न दें।',
      'जीवनसाथी या साझेदार से मतभेद संभव; सौदों में धैर्य रखें।',
      'अचानक बाधा या चिंता; वाहन सावधानी से चलाएँ व जोखिम भरा निवेश न करें।',
      'भाग्य में देरी महसूस हो सकती है; बड़ों से विवाद न करें।',
      'कार्य का दबाव बढ़ेगा; वरिष्ठों से टकराव से बचें।',
      'लाभ में देरी संभव; मित्र व निवेश सोच-समझकर चुनें।',
      'खर्च व नींद की परेशानी बढ़ सकती है; अनावश्यक यात्रा टालें।'],
  },
};

export const PLANET_FLAVOUR = {
  en: {
    Sun: ['Authority figures and government work favour you.', 'Keep ego in check with authority figures.'],
    Moon: ['Emotional balance helps you.', 'Mood swings are possible; rest well.'],
    Mars: ['Energy and drive bring quick results.', 'Control anger and avoid haste.'],
    Mercury: ['Communication, trade and learning go well.', 'Double-check documents and messages.'],
    Jupiter: ['Wisdom, guidance and blessings expand this area.', 'Avoid over-confidence and excess.'],
    Venus: ['Comforts, harmony and charm increase.', 'Avoid indulgence and overspending on luxuries.'],
    Saturn: ['Steady, disciplined effort brings lasting results.', 'Delays test your patience — keep working steadily.'],
    Rahu: ['Unconventional ideas and ambition give gains.', 'Beware of confusion, shortcuts and deception.'],
    Ketu: ['Detachment and intuition protect you.', 'You may feel disinterested; stay focused.'],
  },
  hi: {
    Sun: ['सरकारी कार्यों व अधिकारियों से लाभ मिलेगा।', 'अधिकारियों से व्यवहार में अहंकार न आने दें।'],
    Moon: ['मानसिक संतुलन लाभ देगा।', 'मन विचलित हो सकता है; पर्याप्त विश्राम करें।'],
    Mars: ['ऊर्जा व उत्साह से तुरंत परिणाम मिलेंगे।', 'क्रोध पर नियंत्रण रखें, जल्दबाज़ी न करें।'],
    Mercury: ['संवाद, व्यापार व अध्ययन अच्छे रहेंगे।', 'दस्तावेज़ व संदेश दोबारा जाँच लें।'],
    Jupiter: ['ज्ञान, मार्गदर्शन व आशीर्वाद से वृद्धि होगी।', 'अति आत्मविश्वास व अति से बचें।'],
    Venus: ['सुख-सुविधा, सामंजस्य व आकर्षण बढ़ेगा।', 'भोग-विलास व विलासिता पर अधिक खर्च से बचें।'],
    Saturn: ['नियमित परिश्रम से स्थायी परिणाम मिलेंगे।', 'देरी धैर्य की परीक्षा लेगी — लगातार मेहनत करते रहें।'],
    Rahu: ['नए विचारों व महत्वाकांक्षा से लाभ होगा।', 'भ्रम, शॉर्टकट व धोखे से सावधान रहें।'],
    Ketu: ['वैराग्य व अंतर्ज्ञान आपकी रक्षा करेंगे।', 'मन उचाट रह सकता है; ध्यान केंद्रित रखें।'],
  },
};

// Area summary by level: 0 = challenging, 1 = mixed, 2 = favourable
export const AREA_SUMMARY = {
  en: {
    career: ['Work demands patience this week; finish pending tasks before starting new ones.',
      'Career moves at a steady pace; results depend on consistent effort.',
      'A productive week for work — expect progress, appreciation or a new opportunity.'],
    finance: ['Keep a tight budget; avoid lending, borrowing and speculative investments.',
      'Money flow stays average; plan expenses and avoid impulse buying.',
      'Financial gains are indicated; a good week for planned investments and pending payments.'],
    love: ['Relationships need understanding — listen more and avoid old arguments.',
      'Family life stays balanced with small ups and downs; spend quality time together.',
      'Warmth in relationships; a good week for meeting family, proposals or celebrations.'],
    health: ['Health needs attention — keep a regular routine, sleep well and do not ignore small symptoms.',
      'Health stays fair; moderate exercise and a balanced diet keep you fit.',
      'Good vitality this week; a great time to start a new fitness habit.'],
  },
  hi: {
    career: ['इस सप्ताह कार्य में धैर्य चाहिए; नए काम से पहले लंबित कार्य पूरे करें।',
      'करियर स्थिर गति से आगे बढ़ेगा; परिणाम निरंतर प्रयास पर निर्भर रहेंगे।',
      'कार्य के लिए उत्पादक सप्ताह — प्रगति, प्रशंसा या नया अवसर मिल सकता है।'],
    finance: ['बजट पर नियंत्रण रखें; उधार लेन-देन व सट्टा निवेश से बचें।',
      'आर्थिक स्थिति सामान्य रहेगी; खर्च की योजना बनाएँ, आवेग में खरीदारी न करें।',
      'धन लाभ के योग हैं; योजनाबद्ध निवेश व रुके हुए भुगतान के लिए अच्छा सप्ताह।'],
    love: ['रिश्तों में समझदारी चाहिए — अधिक सुनें और पुराने विवाद न छेड़ें।',
      'पारिवारिक जीवन छोटे उतार-चढ़ाव के साथ संतुलित रहेगा; साथ समय बिताएँ।',
      'रिश्तों में मधुरता; परिवार से मिलने, प्रस्ताव या उत्सव के लिए अच्छा सप्ताह।'],
    health: ['स्वास्थ्य पर ध्यान दें — नियमित दिनचर्या रखें, पूरी नींद लें, छोटे लक्षणों को अनदेखा न करें।',
      'स्वास्थ्य सामान्य रहेगा; हल्का व्यायाम व संतुलित आहार रखें।',
      'इस सप्ताह अच्छी ऊर्जा रहेगी; नई फिटनेस आदत शुरू करने का अच्छा समय।'],
  },
};

export const OVERVIEW_OPEN = {
  en: [
    (sign) => `For ${sign} Lagna, this week calls for caution and patience. A few planets are in difficult houses from your ascendant, so move steadily and avoid big risks.`,
    (sign) => `For ${sign} Lagna, this week brings mixed results. Some areas move forward easily while others need extra effort.`,
    (sign) => `For ${sign} Lagna, this is a supportive week. Several planets are in favourable houses from your ascendant, helping you make real progress.`,
  ],
  hi: [
    (sign) => `${sign} लग्न वालों के लिए यह सप्ताह सावधानी व धैर्य का है। कुछ ग्रह आपके लग्न से कठिन भावों में हैं, इसलिए संभलकर चलें और बड़े जोखिम न लें।`,
    (sign) => `${sign} लग्न वालों के लिए यह सप्ताह मिश्रित फल देने वाला है। कुछ क्षेत्र आसानी से आगे बढ़ेंगे, तो कुछ में अधिक प्रयास लगेगा।`,
    (sign) => `${sign} लग्न वालों के लिए यह सप्ताह सहयोगी है। कई ग्रह आपके लग्न से शुभ भावों में हैं, जिससे वास्तविक प्रगति होगी।`,
  ],
};

export const LORD_LINE = {
  en: (lord, house) => `Your Lagna lord ${lord} is in the ${ORDINAL.en(house)} house, putting focus on ${HOUSE_DOMAIN.en[house - 1]}.`,
  hi: (lord, house) => `आपके लग्नेश ${lord} ${ORDINAL.hi(house)} भाव में हैं, जिससे ${HOUSE_DOMAIN.hi[house - 1]} पर ध्यान रहेगा।`,
};
export const TRANSIT_LINE = {
  en: (p, h, retro) => `${p}${retro ? ' (retrograde)' : ''} in your ${ORDINAL.en(h)} house (${HOUSE_DOMAIN.en[h - 1]})`,
  hi: (p, h, retro) => `${p}${retro ? ' (वक्री)' : ''} आपके ${ORDINAL.hi(h)} भाव (${HOUSE_DOMAIN.hi[h - 1]}) में`,
};
export const EVENT_LINE = {
  en: {
    ingress: (p, s, d) => `${p} enters ${s} on ${d}`,
    retro: (p, d) => `${p} turns retrograde on ${d}`,
    direct: (p, d) => `${p} turns direct on ${d}`,
  },
  hi: {
    ingress: (p, s, d) => `${d} को ${p} का ${s} राशि में प्रवेश`,
    retro: (p, d) => `${d} को ${p} वक्री होंगे`,
    direct: (p, d) => `${d} को ${p} मार्गी होंगे`,
  },
};
export const DAY_NOTE = {
  en: { good: 'Good for important work', caution: 'Avoid major decisions', neutral: 'Routine tasks' },
  hi: { good: 'महत्वपूर्ण कार्यों हेतु शुभ', caution: 'बड़े निर्णय टालें', neutral: 'सामान्य कार्य' },
};

export const COLOURS = {
  en: { Sun: 'Orange / Copper', Moon: 'White / Silver', Mars: 'Red', Mercury: 'Green', Jupiter: 'Yellow', Venus: 'Pink / Cream', Saturn: 'Navy blue', Rahu: 'Grey', Ketu: 'Brown' },
  hi: { Sun: 'नारंगी / तांबा', Moon: 'सफ़ेद / चाँदी', Mars: 'लाल', Mercury: 'हरा', Jupiter: 'पीला', Venus: 'गुलाबी / क्रीम', Saturn: 'गहरा नीला', Rahu: 'स्लेटी', Ketu: 'भूरा' },
};

export const REMEDIES = {
  en: {
    Sun: 'Offer water to the rising Sun daily and chant “Om Suryaya Namah” 11 times.',
    Moon: 'Offer water or milk on a Shivling on Monday and keep your mind calm with a few minutes of meditation.',
    Mars: 'Recite the Hanuman Chalisa on Tuesday and donate red lentils (masoor dal).',
    Mercury: 'Feed green fodder to a cow on Wednesday and chant “Om Budhaya Namah”.',
    Jupiter: 'Apply a turmeric tilak on Thursday, respect teachers and donate chana dal.',
    Venus: 'Worship Goddess Lakshmi on Friday and donate white sweets or rice.',
    Saturn: 'Light a mustard-oil lamp under a Peepal tree on Saturday and help workers or the needy.',
    Rahu: 'Chant “Om Rahave Namah” 18 times, feed stray dogs and avoid intoxicants.',
    Ketu: 'Worship Lord Ganesha, chant “Om Ketave Namah” and donate a blanket.',
  },
  hi: {
    Sun: 'प्रतिदिन उगते सूर्य को जल अर्पित करें और 11 बार “ॐ सूर्याय नमः” का जाप करें।',
    Moon: 'सोमवार को शिवलिंग पर जल या दूध चढ़ाएँ और कुछ मिनट ध्यान करके मन शांत रखें।',
    Mars: 'मंगलवार को हनुमान चालीसा का पाठ करें और मसूर दाल का दान करें।',
    Mercury: 'बुधवार को गाय को हरा चारा खिलाएँ और “ॐ बुधाय नमः” का जाप करें।',
    Jupiter: 'गुरुवार को हल्दी का तिलक लगाएँ, गुरुजनों का सम्मान करें और चने की दाल दान करें।',
    Venus: 'शुक्रवार को माँ लक्ष्मी की पूजा करें और सफ़ेद मिठाई या चावल का दान करें।',
    Saturn: 'शनिवार को पीपल के नीचे सरसों के तेल का दीपक जलाएँ और श्रमिकों या ज़रूरतमंदों की सहायता करें।',
    Rahu: '18 बार “ॐ राहवे नमः” का जाप करें, आवारा कुत्तों को भोजन दें और नशे से दूर रहें।',
    Ketu: 'भगवान गणेश की पूजा करें, “ॐ केतवे नमः” का जाप करें और कंबल का दान करें।',
  },
};

// ---------- Lordship, aspects, Moon timeline, do's & don'ts ----------
Object.assign(UI.en, {
  rules: 'Lord of', aspects: 'Aspects', moonTimeline: 'Moon’s journey through your houses', from: 'from', till: 'till',
  dosDonts: 'Do’s & don’ts this week', doLabel: 'Do', dontLabel: 'Avoid', lordship: 'House lords this week',
  weekStartLabel: 'week start', weekEndLabel: 'week end',
});
Object.assign(UI.hi, {
  rules: 'स्वामी', aspects: 'दृष्टि', moonTimeline: 'आपके भावों में चंद्रमा का गोचर', from: 'से', till: 'तक',
  dosDonts: 'इस सप्ताह क्या करें, क्या न करें', doLabel: 'करें', dontLabel: 'न करें', lordship: 'इस सप्ताह भावेशों की स्थिति',
  weekStartLabel: 'सप्ताह आरंभ', weekEndLabel: 'सप्ताह अंत',
});

const SANSKRIT_ORD = ['प्रथम', 'द्वितीय', 'तृतीय', 'चतुर्थ', 'पंचम', 'षष्ठ', 'सप्तम', 'अष्टम', 'नवम', 'दशम', 'एकादश', 'द्वादश'];
const listHouses = {
  en: (hs) => hs.map((h) => ORDINAL.en(h)).join(' & '),
  hi: (hs) => hs.map((h) => SANSKRIT_ORD[h - 1]).join(' व '),
};

// "Venus, your 2nd & 7th lord, is in your 8th house"
export const LORDSHIP_LINE = {
  en: (p, rules, h) => `${p}, lord of your ${listHouses.en(rules)} house${rules.length > 1 ? 's' : ''}, sits in your ${ORDINAL.en(h)} house`,
  hi: (p, rules, h) => `${listHouses.hi(rules)} भाव के स्वामी ${p} आपके ${ORDINAL.hi(h)} भाव में हैं`,
};

// Area-specific lord placement: "Your 10th lord (career) Saturn is in the 12th house — …"
export const AREA_LORD_LINE = {
  en: (n, p, h, good) => `Your ${ORDINAL.en(n)} lord ${p} is placed in the ${ORDINAL.en(h)} house (${HOUSE_DOMAIN.en[h - 1]}), `
    + (good ? 'which supports this area.' : 'so results here come with some delay or effort.'),
  hi: (n, p, h, good) => `आपके ${SANSKRIT_ORD[n - 1]} भाव के स्वामी ${p} ${ORDINAL.hi(h)} भाव (${HOUSE_DOMAIN.hi[h - 1]}) में हैं, `
    + (good ? 'जो इस क्षेत्र में सहयोग देगा।' : 'इसलिए यहाँ परिणाम कुछ देरी या मेहनत से मिलेंगे।'),
};

export const ASPECT_LINE = {
  en: {
    Jupiter: (h) => `Jupiter’s blessing aspect falls on your ${ORDINAL.en(h)} house, protecting ${HOUSE_DOMAIN.en[h - 1]}.`,
    Saturn: (h) => `Saturn aspects your ${ORDINAL.en(h)} house: ${HOUSE_DOMAIN.en[h - 1]} need discipline and patience.`,
    Mars: (h) => `Mars aspects your ${ORDINAL.en(h)} house: keep your temper in check around ${HOUSE_DOMAIN.en[h - 1]}.`,
  },
  hi: {
    Jupiter: (h) => `गुरु की शुभ दृष्टि आपके ${ORDINAL.hi(h)} भाव पर है, जिससे ${HOUSE_DOMAIN.hi[h - 1]} सुरक्षित रहेंगे।`,
    Saturn: (h) => `शनि की दृष्टि ${ORDINAL.hi(h)} भाव पर है: ${HOUSE_DOMAIN.hi[h - 1]} में अनुशासन व धैर्य रखें।`,
    Mars: (h) => `मंगल की दृष्टि ${ORDINAL.hi(h)} भाव पर है: ${HOUSE_DOMAIN.hi[h - 1]} के मामलों में क्रोध पर नियंत्रण रखें।`,
  },
};

// What the Moon in each house from Lagna favours (Chandra gochar), used in the timeline
export const MOON_HOUSE_NOTE = {
  en: ['Energy and confidence are high; start new things.', 'Focus on family and money; speak sweetly.',
    'Good for effort, short trips and communication.', 'Mood may dip; stay home, rest, look after mother.',
    'Creative and romantic; avoid speculation.', 'Win over rivals; clear pending tasks and debts.',
    'Good for partnerships, meetings and the spouse.', 'Sensitive phase: avoid risks, arguments and big decisions.',
    'Luck supports; seek guidance, plan, pray.', 'Strong for career moves and meetings with seniors.',
    'Gains and good news; network and follow up.', 'Expenses and fatigue; rest, meditate, avoid lending.'],
  hi: ['ऊर्जा व आत्मविश्वास अधिक; नए काम शुरू करें।', 'परिवार व धन पर ध्यान; वाणी मधुर रखें।',
    'मेहनत, छोटी यात्रा व संवाद के लिए अच्छा।', 'मन बेचैन रह सकता है; घर पर विश्राम, माता का ध्यान रखें।',
    'रचनात्मक व प्रेमपूर्ण समय; सट्टे से बचें।', 'शत्रुओं पर विजय; रुके काम व ऋण निपटाएँ।',
    'साझेदारी, बैठकों व जीवनसाथी के लिए शुभ।', 'संवेदनशील समय: जोखिम, विवाद व बड़े निर्णय टालें।',
    'भाग्य साथ देगा; मार्गदर्शन लें, योजना बनाएँ, पूजा करें।', 'करियर के कदमों व वरिष्ठों से मिलने हेतु उत्तम।',
    'लाभ व शुभ समाचार; संपर्क बढ़ाएँ।', 'खर्च व थकान; विश्राम, ध्यान करें, उधार न दें।'],
};

// Advice keyed by house: do (when a planet there is supportive) / avoid (when challenging)
export const HOUSE_DO = {
  en: ['Take initiative and put yourself forward.', 'Save money and invest in family bonds.', 'Make calls, pitch ideas, take short trips.',
    'Spend time at home; plan property or vehicle matters.', 'Study, create, and spend time with children.', 'Tackle competition and clear debts.',
    'Strengthen partnerships and close deals.', 'Research and handle insurance or joint finances quietly.', 'Seek a mentor’s advice; pilgrimage or prayer.',
    'Push career goals and meet seniors.', 'Network and follow up on pending payments.', 'Plan foreign work; rest and meditate.'],
  hi: ['पहल करें और स्वयं को आगे रखें।', 'बचत करें, परिवार से संबंध मज़बूत करें।', 'संपर्क करें, विचार रखें, छोटी यात्रा करें।',
    'घर पर समय दें; भूमि-वाहन की योजना बनाएँ।', 'पढ़ाई, सृजन करें, संतान को समय दें।', 'प्रतियोगिता का सामना करें, ऋण चुकाएँ।',
    'साझेदारी मज़बूत करें, सौदे पूरे करें।', 'शोध करें, बीमा/संयुक्त धन चुपचाप संभालें।', 'गुरु की सलाह लें; तीर्थ या पूजा करें।',
    'करियर लक्ष्यों पर ज़ोर दें, वरिष्ठों से मिलें।', 'संपर्क बढ़ाएँ, रुके भुगतान वसूलें।', 'विदेश कार्य की योजना; विश्राम व ध्यान करें।'],
};
export const HOUSE_AVOID = {
  en: ['Ego clashes and neglecting your health.', 'Harsh words and impulsive spending.', 'Overconfidence and quarrels with siblings.',
    'Domestic arguments and property disputes.', 'Speculation and rushing into romance.', 'Lending money and ignoring small health issues.',
    'Arguments with your partner and signing deals in haste.', 'Risky ventures, secrets and night driving.', 'Disrespecting elders and long, unplanned trips.',
    'Clashing with your boss or switching jobs on impulse.', 'Trusting new friends with money.', 'Overspending and losing sleep.'],
  hi: ['अहंकार के टकराव व स्वास्थ्य की अनदेखी।', 'कटु वचन व आवेश में खर्च।', 'अति-आत्मविश्वास व भाई-बहनों से विवाद।',
    'घरेलू कलह व संपत्ति विवाद।', 'सट्टा व प्रेम में जल्दबाज़ी।', 'उधार देना व छोटी बीमारियों की अनदेखी।',
    'जीवनसाथी से बहस व जल्दबाज़ी में अनुबंध।', 'जोखिम भरे काम, गोपनीयता व रात की यात्रा।', 'बड़ों का अनादर व बिना योजना लंबी यात्रा।',
    'बॉस से टकराव या आवेश में नौकरी बदलना।', 'नए मित्रों पर धन का भरोसा।', 'फिज़ूलखर्च व नींद की कमी।'],
};
