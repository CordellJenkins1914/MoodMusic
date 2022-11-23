import { React, useState } from 'react';
import { Main, DropDownContainer, DropDownHeader, DropDownListContainer, DropDownList, ListItem } from '../styles';
import { getMood } from '../spotify';

const options = ["happy", "sad", "angry", "excited"];

const Dropdown = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null);
    const toggling = () => setIsOpen(!isOpen);
    const onOptionClicked = value => () => {
        setSelectedOption(value);
        setIsOpen(false);
        getMood(value);
  };
    return (
        <Main>
          <h1>What's your mood</h1>
          <DropDownContainer>
            <DropDownHeader onClick={toggling}>
              {selectedOption || "Mood"}
            </DropDownHeader>
            {isOpen && (
              <DropDownListContainer>
                <DropDownList>
                  {options.map(option => (
                    <ListItem onClick={onOptionClicked(option)} key={Math.random()}>
                      {option}
                    </ListItem>
                  ))}
                </DropDownList>
              </DropDownListContainer>
            )}
          </DropDownContainer>
        </Main>
    );
}
export default Dropdown;