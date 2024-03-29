import styled from "styled-components";

export const Main = styled("div")`
  font-family: sans-serif;
  background: linear-gradient(transparent, rgba(0,0,0,0.5));
  background-color: var(--grey);
  height: 100vh;
`;

export const DropDownContainer = styled("div")`
  width: 10.5em;
  margin: 0 auto;
  background: linear-gradient(transparent, rgba(0,0,0,0.5));
  background-color: var(--green);
`;

export const DropDownHeader = styled("div")`
  margin-bottom: 0.8em;
  padding: 0.4em 2em 0.4em 1em;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.15);
  font-weight: 500;
  font-size: 1.3rem;
  color: var(--black);
`;

export const DropDownListContainer = styled("div")`
  position: absolute;
  z-index: 100;
  width: 10.5em;

`;

export const DropDownList = styled("ul")`
  padding: 0;
  margin: 0;
  padding-left: 1em;
  background: var(--green);
  border: 2px solid #e5e5e5;
  box-sizing: border-box;
  color: var(--black);
  font-size: 1.3rem;
  font-weight: 500;
  &:first-child {
    padding-top: 0.8em;
  }
`;

export const ListItem = styled("li")`
  list-style: none;
  margin-bottom: 0.8em;
  &:hover {
    color: #fd9e46;
  }
`;