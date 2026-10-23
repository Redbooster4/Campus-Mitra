export const languages = [
  { value: "English", label: "English", tag: "EN" },
  { value: "Hindi", label: "Hindi", tag: "हिन्दी" },
  { value: "Marathi", label: "Marathi", tag: "मराठी" },
  { value: "Gujarati", label: "Gujarati", tag: "ગુજરાતી" },
];

export const translations = {
  English: {
    initialMsg: (name) =>
      `Hey ${name}! I'm Mitra, your campus counselor and academic advisor. What's on your mind today?`,
    newChatMsg: (name) =>
      `Hey ${name}! How can I help you in this new session?`,
    resetMsg: (name) =>
      `Fresh start! How can I help you today, ${name}?`,
    suggestions: [
      {
        label: "Course Recommendations",
        query: "Can you help me choose the right courses for next semester?",
      },
      {
        label: "Scholarships & Financial Aid",
        query: "What scholarship and financial aid options are available?",
      },
      {
        label: "Admission Deadlines & Fees",
        query: "What are the upcoming admission deadlines and fee structures?",
      },
      {
        label: "Privacy & Stored Details",
        query: "What details does the chatbot have of me?",
      },
      {
        label: "Escalate to Human Counselor",
        query: "Escalate my query to a human counselor",
      },
    ],
  },
  Hindi: {
    initialMsg: (name) =>
      `नमस्ते ${name}! मैं मित्रा हूँ, आपका कैंपस काउंसलर और शैक्षणिक सलाहकार। आज मैं आपकी क्या मदद कर सकता हूँ?`,
    newChatMsg: (name) =>
      `नमस्ते ${name}! इस नए सत्र में मैं आपकी क्या मदद कर सकता हूँ?`,
    resetMsg: (name) =>
      `नई शुरुआत! आज मैं आपकी क्या मदद कर सकता हूँ, ${name}?`,
    suggestions: [
      {
        label: "पाठ्यक्रम सुझाव",
        query: "क्या आप मुझे अगले सेमेस्टर के लिए सही कोर्स चुनने में मदद कर सकते हैं?",
      },
      {
        label: "छात्रवृत्ति और वित्तीय सहायता",
        query: "कौन सी छात्रवृत्ति और वित्तीय सहायता विकल्प उपलब्ध हैं?",
      },
      {
        label: "प्रवेश समय सीमा और फीस",
        query: "आगामी प्रवेश की समय सीमा और फीस संरचना क्या है?",
      },
      {
        label: "गोपनीयता और मेरा विवरण",
        query: "चैटबॉट के पास मेरे बारे में क्या विवरण हैं?",
      },
      {
        label: "काउंसलर को भेजें",
        query: "सलाहकार से बात करना चाहते हैं",
      },
    ],
  },
  Marathi: {
    initialMsg: (name) =>
      `नमस्कार ${name}! मी मित्रा आहे, तुमचा कॅम्पस समुपदेशक आणि शैक्षणिक सल्लागार. आज मी तुमची काय मदत करू शकतो?`,
    newChatMsg: (name) =>
      `नमस्कार ${name}! या नवीन सत्रात मी तुमची काय मदत करू शकतो?`,
    resetMsg: (name) =>
      `नवीन सुरुवात! आज मी तुमची काय मदत करू शकतो, ${name}?`,
    suggestions: [
      {
        label: "अभ्यासक्रम शिफारसी",
        query: "पुढील सत्रासाठी योग्य अभ्यासक्रम निवडण्यासाठी तुम्ही मला मदत करू शकता का?",
      },
      {
        label: "शिष्यवृत्ती आणि आर्थिक मदत",
        query: "कोणते शिष्यवृत्ती आणि आर्थिक मदतीचे पर्याय उपलब्ध आहेत?",
      },
      {
        label: "प्रवेश अंतिम मुदत आणि फी",
        query: "आगामी प्रवेशाची अंतिम मुदत आणि फी संरचना काय आहे?",
      },
      {
        label: "गोपनीयता आणि माझे तपशील",
        query: "माझ्याबद्दल चॅटबॉटकडे कोणते तपशील आहेत?",
      },
      {
        label: "समुपदेशकाला पाठवा",
        query: "मानव समुपदेशक यांच्याशी बोला",
      },
    ],
  },
  Gujarati: {
    initialMsg: (name) =>
      `નમસ્તે ${name}! હું મિત્રા છું, તમારો કેમ્પસ કાઉન્સેલર અને શૈક્ષણિક સલાહકાર. આજે હું તમારી શું મદદ કરી શકું?`,
    newChatMsg: (name) =>
      `નમસ્તે ${name}! આ નવા સત્રમાં હું તમારી શું મદદ કરી શકું?`,
    resetMsg: (name) =>
      `નવી શરૂઆત! આજે હું તમારી શું મદદ કરી શકું, ${name}?`,
    suggestions: [
      {
        label: "કોર્સ ભલામણો",
        query: "શું તમે મને આગલા સેમેસ્ટર માટે યોગ્ય કોર્સ પસંદ કરવામાં મદદ કરી શકો છો?",
      },
      {
        label: "શિષ્યવૃત્તિ અને નાણાકીય સહાય",
        query: "કયા શિષ્યવૃત્તિ અને નાણાકીય સહાયના વિકલ્પો ઉપલબ્ધ છે?",
      },
      {
        label: "પ્રવેશની અંતિમ તારીખ અને ફી",
        query: "આગામી પ્રવેશની અંતિમ તારીખ અને ફી માળખું શું છે?",
      },
      {
        label: "ગોપનીયતા અને મારી વિગતો",
        query: "ચેટબોટ પાસે મારા વિશે શું વિગતો છે?",
      },
      {
        label: "કાઉન્સેલરને મોકલો",
        query: "માનવ કાઉન્સેલર સાથે વાત કરવી છે",
      },
    ],
  },
};
