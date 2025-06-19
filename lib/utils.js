// Common utility helpers used across the game logic
// randomInt(min, max)  -> returns integer in [min, max]
// clamp(value, min, max) -> clamps a numeric value inside the given range
// randChoice(array) -> returns a random element from a non-empty array

(function(global){
  function randomInt(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function clamp(value, min, max){
    return Math.max(min, Math.min(max, value));
  }

  function randChoice(array){
    if(!array || array.length === 0) return undefined;
    return array[randomInt(0, array.length - 1)];
  }

  global.randomInt = randomInt;
  global.clamp = clamp;
  global.randChoice = randChoice;
})(this);
