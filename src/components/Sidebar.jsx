import { useState } from "react";
import { first151Pokemon, getFullPokedexNumber } from "../utils";
export function Sidebar(props) {
  const { selectedPokemon, setSelectedPokemon, handleCloseMenu, showSideMenu } = props;
  const [searchValue, setSearchValue ] = useState('')

  const filteredPokemon = first151Pokemon.filter((ele, eleIndex) => {
    // If full pokedex number includes the current search value, return true
    if (getFullPokedexNumber(eleIndex).includes(searchValue)) { return true}
    // If the pokemon name includes the current serach value, return true
    if (ele.toLowerCase().includes(searchValue.toLowerCase())) { return true}

    // Otherwise, exclue other value from array
    return false
  })
  return (
    <nav className={' ' + (!showSideMenu ? " open": " ")}>
      <div className={"header" + (!showSideMenu ? " open": " ")}>
        <button onClick={handleCloseMenu} className="open-nav-button">
          <i class="fa-solid fa-arrow-left-long"></i>
        </button>
        <h1 className="text-gradient">Pokedéx</h1>
      </div>
      <input placeholder="E.g. 001 or Bulba..." value={searchValue} onChange={(e) => {setSearchValue(e.target.value)}}/>
      {filteredPokemon.map((pokemon, pokemonIndex) => {
        const truePokedexNumber = first151Pokemon.indexOf(pokemon)
        return (
          <button
            key={pokemonIndex}
            className={
              "nav-card " +
              (pokemonIndex === selectedPokemon ? "nav-card-selected" : " ")
            }
            onClick={() => {
              setSelectedPokemon(truePokedexNumber);
              handleCloseMenu()
            }}
          >
            <p>{getFullPokedexNumber(truePokedexNumber)}</p>
            <p>{pokemon}</p>
          </button>
        );
      })}
    </nav>
  );
}
