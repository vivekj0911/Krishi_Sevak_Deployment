import axios from "axios";

export const translateText = async (inputText, inputLanguage, outputLanguage) => {
  try {
    const response = await axios.get(
      `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${inputLanguage}&tl=${outputLanguage}&dt=t&q=${encodeURI(inputText)}`
    );

    // Extract translated text from API response
    return response.data[0].map((item) => item[0]).join(" ");
  } catch (error) {
    console.error("Translation error:", error);
    return inputText; // Fallback to original text if translation fails
  }
};
