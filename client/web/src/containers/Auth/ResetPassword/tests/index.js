import * as React from "react";
import renderer from "react-test-renderer";

import GENERIC_COMPONENT from "../GENERIC_COMPONENT";

it("renders correctly", () => {
  const tree = renderer.create(<GENERIC_COMPONENT />).toJSON();
  expect(tree).toMatchSnapshot();
});
