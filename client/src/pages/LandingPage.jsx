import { useState } from "react";
 import { Link } from "react-router-dom";
 import landingImg from "../assets/landing.jpg";
 import LanguageSelector from "../components/LanguageSelector";
 
 const LandingPage = () => {
   const defaultTexts = {
     title: "Smart Farming, Smarter Future",
     description: "Revolutionize your farming with data-driven insights, weather predictions, and crop management tools.",
     login: "Login",
     signup: "Sign Up",
     about: "About",
     contact: "Contact",
     help: "Help",
     footer: `© ${new Date().getFullYear()} SmartFarm. All rights reserved.`,
   };
 
   const [translatedText, setTranslatedText] = useState(defaultTexts);
 
   return (
     <div className="relative min-h-screen flex flex-col">
       {/* Background */}
       <div className="absolute inset-0 bg-cover bg-red-900 bg-center z-0"></div>
       <div className="absolute inset-0 bg-cover bg-center z-0" 
       style={{
         backgroundImage: `url(${landingImg})`,
         filter: "brightness(0.7)",
       }}
       ></div>
       
 
       {/* Content */}
       <div className="relative z-10 flex-1 flex flex-col">
         {/* Header */}
         <header className="p-4 flex justify-between items-center">
           <div className="text-white font-bold text-xl">SmartFarm</div>
           <LanguageSelector
             textKeys={Object.keys(defaultTexts).map((key) => ({ key, value: defaultTexts[key] }))}
             setTranslatedText={setTranslatedText}
           />
         </header>
 
         {/* Main Content */}
         <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
           <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">{translatedText.title}</h1>
           <p className="text-white text-lg mb-8 max-w-md">{translatedText.description}</p>
 
           <div className="flex flex-col sm:flex-row gap-4">
             <Link
               to="/login"
               className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300"
             >
               {translatedText.login}
             </Link>
             <Link
               to="/signup"
               className="bg-white hover:bg-gray-100 text-green-700 font-bold py-3 px-8 rounded-full text-lg transition-colors duration-300"
             >
               {translatedText.signup}
             </Link>
           </div>
         </main>
 
         {/* Footer */}
         <footer className="p-6 text-center text-white">
           <div className="flex justify-center space-x-6">
             <Link to="/about" className="hover:underline">{translatedText.about}</Link>
             <Link to="/contact" className="hover:underline">{translatedText.contact}</Link>
             <Link to="/help" className="hover:underline">{translatedText.help}</Link>
           </div>
           <div className="mt-4">
             <p>{translatedText.footer}</p>
           </div>
         </footer>
       </div>
     </div>
   );
 };
 
 export default LandingPage;