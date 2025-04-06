import { useState } from "react";
import { translateText } from "../utils/translate";

const LanguageSelector = ({ textKeys, setTranslatedText }) => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [loading, setLoading] = useState(false);

  const handleLanguageChange = async (event) => {
    const newLanguage = event.target.value;
    setSelectedLanguage(newLanguage);
    setLoading(true);

    try {
      const translatedTexts = await Promise.all(
        textKeys.map(async (text) => ({
          key: text.key,
          value: await translateText(text.value, "en", newLanguage),
        }))
      );

      // Convert array to object for state update
      const translations = translatedTexts.reduce((acc, item) => {
        acc[item.key] = item.value;
        return acc;
      }, {});

      setTranslatedText(translations);
    } catch (error) {
      console.error("Translation failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      value={selectedLanguage}
      onChange={handleLanguageChange}
      disabled={loading}
      className="w-30 p-1 text-sm border border-gray-300 rounded bg-transparent text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
    >
      <option value="en">English</option>
      <option value="hi">हिन्दी (Hindi)</option>
      <option value="bn">বাংলা (Bengali)</option>
      <option value="mr">मराठी (Marathi)</option>
      <option value="te">తెలుగు (Telugu)</option>
      <option value="ta">தமிழ் (Tamil)</option>
      <option value="gu">ગુજરાતી (Gujarati)</option>
    </select>
  );  
};

export default LanguageSelector;
