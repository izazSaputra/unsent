import React, { useState } from "react";

import Hero from "./Components/Hero";
import Manifesto from "./Components/Manifesto";
import SectionIndex from "./Components/SectionIndex";
import SelectedWorks from "./Components/SelectedWorks";

const App = () => {
  const [activeSection, setActiveSection] = useState({
    number: "00",
    label: "IDENTITY",
  });

  return (
    <main data-active-section={activeSection.number}>
      <SectionIndex section={activeSection} />

      <Hero setActiveSection={setActiveSection} />

      <Manifesto setActiveSection={setActiveSection} />

      <SelectedWorks setActiveSection={setActiveSection}/>
    </main>
  );
};

export default App;
