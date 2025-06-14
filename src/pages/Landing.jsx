import FAQ from "../components/FAQ";
import Feature from "../components/Feature";
import Footer from "../components/Footer";
import Hero from "../components/Hero";
import { ProblemSol } from "../components/ProblemSol";

const Landing = () => {
  return (
    <>
      <Hero />
      <Feature />
      <ProblemSol />
      <FAQ />
      <Footer/>
    </>
  );
};
export default Landing;
