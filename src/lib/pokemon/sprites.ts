const SPRITES = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
const CRIES = "https://raw.githubusercontent.com/PokeAPI/cries/main/cries/pokemon";

export function artworkUrl(id: number, shiny = false): string {
  return `${SPRITES}/other/official-artwork/${shiny ? "shiny/" : ""}${id}.png`;
}

export function homeSpriteUrl(id: number, shiny = false): string {
  return `${SPRITES}/other/home/${shiny ? "shiny/" : ""}${id}.png`;
}

export function pixelSpriteUrl(id: number, shiny = false): string {
  return `${SPRITES}/${shiny ? "shiny/" : ""}${id}.png`;
}

export function animatedSpriteUrl(id: number, shiny = false): string {
  return `${SPRITES}/other/showdown/${shiny ? "shiny/" : ""}${id}.gif`;
}

export function cryUrl(id: number, legacy = false): string {
  return `${CRIES}/${legacy ? "legacy" : "latest"}/${id}.ogg`;
}
