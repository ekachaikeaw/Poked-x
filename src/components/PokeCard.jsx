import { useEffect, useState } from "react";
import { getFullPokedexNumber, getPokedexNumber } from "../utils";
import { TypeCard } from "./TypeCard";
import { Modal } from "./Modal";

export function PokeCard(props) {
  const { selectedPokemon } = props;
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [skill, setSkill] = useState(null);
  const [loadingSkill, setLoadingSkill] = useState(false);

  const { name, height, abilities, stats, types, moves, sprites } = data || {};

  const imgList = Object.keys(sprites || {}).filter((val) => {
    if (!sprites[val]) {
      return false;
    }
    if (["versions", "other"].includes(val)) {
      return false;
    }
    return true;
  });

  async function fetchMoveData(move, moveUrl) {
    if (loadingSkill || !localStorage || !moveUrl) {
      return;
    }

    // Check cache for move
    let c = {};
    if (localStorage.getItem("pokedex-moves")) {
      c = JSON.parse(localStorage.getItem("pokedex-moves"));
    }
    // Found in cache set skill by cache and out
    if (move in c) {
      setSkill(c[move]);
      console.log("Found skill in cache");
      return;
    }

    // Not found in cache then get from API
    try {
      setLoadingSkill(true);
      const res = await fetch(moveUrl);
      const moveData = await res.json();
      console.log("Fetched move from API", moveData);
      const description = moveData?.flavor_text_entries.filter((val) => {
        return val.version_group.name == "firered-leafgreen";
      })[0]?.flavor_text;

      const skillData = {
        name: move,
        description
      }
      setSkill(skillData)
      c[move] = skillData
      localStorage.setItem('pokedex-moves', JSON.stringify(c))
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingSkill(false);
    }
  }
  useEffect(() => {
    // If loading exit
    if (loading || !localStorage) {
      return;
    }
    // Check if info available from cache
    // 1. Define cache
    let cache = {};
    if (localStorage.getItem("pokedex")) {
      cache = JSON.parse(localStorage.getItem("pokedex"));
    }
    // 2. If cache has selected info, setData from cache and return
    if (selectedPokemon in cache) {
      setData(cache[selectedPokemon]);
      console.log("Found pokemon in cache");
      return;
    }

    async function fetchPokemonData() {
      setLoading(true);
      try {
        const baseURL = "https://pokeapi.co/api/v2/";
        const suffix = "pokemon/" + getPokedexNumber(selectedPokemon);
        const finalURL = baseURL + suffix;
        const res = await fetch(finalURL);
        const pokemonData = await res.json();
        setData(pokemonData);
        console.log("Fetched pokemon from API");
        cache[selectedPokemon] = pokemonData;
        localStorage.setItem("pokedex", JSON.stringify(cache));
      } catch (error) {
      } finally {
        setLoading(false);
      }
    }
    // Otherwise fetch from API
    fetchPokemonData();
  }, [selectedPokemon]);

  if (loading || !data) {
    return (
      <div>
        <h4>Loading...</h4>
      </div>
    );
  }
  return (
    <div className="poke-card">
      {skill && (
        <Modal
          handleCloseModal={() => {
            setSkill(null);
          }}
        >
          <div>
            <h6>Name</h6>
            <h2 className="skill-name">{skill.name.replaceAll("-", " ")}</h2>
          </div>
          <div>
            <h6>Description</h6>
            <p>{skill.description}</p>
          </div>
        </Modal>
      )}
      <div>
        <h4>#{getPokedexNumber(selectedPokemon)}</h4>
        <h2>{name}</h2>
      </div>
      <div className="type-container">
        {types.map((typeObj, typeIndex) => {
          return <TypeCard key={typeIndex} type={typeObj?.type?.name} />;
        })}
      </div>
      <img
        className="default-img"
        src={"/pokemon/" + getFullPokedexNumber(selectedPokemon) + ".png"}
        alt={`${name}-large-img`}
      />
      <div className="img-container">
        {imgList.map((spriteUrl, spriteIndex) => {
          const imgUrl = sprites[spriteUrl];
          return (
            <img
              key={spriteIndex}
              src={imgUrl}
              alt={`${name}-img-${spriteUrl}`}
            />
          );
        })}
      </div>
      <h3>Stats</h3>
      <div className="stats-card">
        {stats.map((statObj, statIndex) => {
          const { stat, base_stat } = statObj;
          return (
            <div key={statIndex} className="stat-item">
              <p>{stat?.name.replaceAll("-", " ")}</p>
              <h4>{base_stat}</h4>
            </div>
          );
        })}
      </div>
      <h3>Moves</h3>
      <div className="pokemon-move-grid">
        {moves.map((moveObj, moveIndex) => {
          return (
            <button
              key={moveIndex}
              className="button-card pokemon-move"
              onClick={() => { fetchMoveData(moveObj?.move?.name, moveObj?.move?.url)}}
            >
              <p>{moveObj?.move?.name.replaceAll("-", " ")}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
