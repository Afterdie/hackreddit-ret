import { Devvit, useState } from "@devvit/public-api";

import { PageType } from "../types/props.js";
import { PageProps } from "../types/props.js";

import FlexPage from "./FlexPage.js";
import HatchPage from "./HatchPage.js";

const App: Devvit.CustomPostComponent = (context: Devvit.Context) => {
  const [page, navigate] = useState(PageType.FLEXPAGE);

  const props: PageProps = {
    navigate,
    context,
  };

  if (page === PageType.FLEXPAGE) {
    return <FlexPage {...props} />;
  } else {
    return <HatchPage {...props} />;
  }
};

export default App;
