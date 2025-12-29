import styles from "./About.module.css";
import Landing from "../Components/About/Landing/Landing";
import OurPhilosophy from "../Components/About/OurPhilosophy/OurPhilosophy";
import Recognitions from "../Components/About/Recognitions/Recognitions";
import Partnerships from "../Components/About/Partnerships/Partnerships";
import WhyUs from "../Components/About/WhyUs/WhyUs";
import OurValues from "../Components/About/OurValues/OurValues";

export default function AboutUs() {
  return (
    <>
      <Landing />
      <OurPhilosophy />
      {/* <OurValues /> */}
      <WhyUs />
      {/* <Partnerships /> */}
      <Recognitions />
    </>
  );
}
