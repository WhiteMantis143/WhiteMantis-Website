import Image from "next/image";
import Landing from "../Components/Contact/Landing/Landing";
import MightFit from "../Components/Contact/MightFit/MightFit";
import Career from "../Components/Contact/Career/Career";
import Location from "../Components/Contact/Location/Location";
import ContactForm from "../Components/Contact/ContactForm/ContactForm";



export default function contact() {
  return (
   <>
  
   <Landing />

   <ContactForm />
   <Location />
     {/* <Career />
   <MightFit /> */}
 
  </>
  );
}
