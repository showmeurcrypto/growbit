const crypto = require("crypto");

function generateShuffledGroup(groupSize, hash) {
  let randomNumbers = [];
  let shuffleNonce = 0;

  do {
    const newHash = generateHmac(hash, shuffleNonce.toString());
    const tempArr = seedToBytes(newHash);
    const randomArr = randomNumbers.concat(
      bytesToNumbers(tempArr, newHash.length * 4),
    );
    randomNumbers = randomArr;
    shuffleNonce += 1;
  } while (randomNumbers.length < groupSize);

  if (randomNumbers.length > groupSize) {
    randomNumbers = randomNumbers.slice(0, groupSize);
  }

  return shuffleGroup(randomNumbers, groupSize);
}

/**
 * Fisher-Yates-Durstenfeld shuffle algorithm.
 */
function shuffleGroup(randomNumbers, groupSize) {
  const shuffledNumbers = Array.from({ length: groupSize }, (_, i) => i);

  let randIndex = 0;
  for (let i = groupSize - 1; i > 0; i--) {
    const j = Math.floor(randomNumbers[randIndex] * (i + 1));

    const tmp = shuffledNumbers[j];
    shuffledNumbers[j] = shuffledNumbers[i];
    shuffledNumbers[i] = tmp;
    randIndex += 1;
  }

  return shuffledNumbers;
}

const buildRandomBools = (numberCount, hash) => {
  let randomNumbers = [];
  let shuffleNonce = 0;

  do {
    const newHash = generateHmac(hash, shuffleNonce.toString());
    const tempArr = seedToBytes(newHash);
    randomNumbers = randomNumbers.concat(
      bytesToNumbers(tempArr, newHash.length * 4),
    );
    shuffleNonce += 1;
  } while (randomNumbers.length < numberCount);

  if (randomNumbers.length > numberCount) {
    randomNumbers = randomNumbers.slice(0, numberCount);
  }

  return randomNumbers.map((num) => Math.floor(num * 2));
};

const buildRandomFloats = (numberCount, hash) => {
  let randomNumbers = [];
  let shuffleNonce = 0;

  do {
    const newHash = generateHmac(hash, shuffleNonce.toString());
    console.log("new hash");
    console.log(newHash);
    const tempArr = seedToBytes(newHash);
    randomNumbers = randomNumbers.concat(
      bytesToNumbers(tempArr, newHash.length * 4),
    );
    shuffleNonce += 1;
  } while (randomNumbers.length < numberCount);

  if (randomNumbers.length > numberCount) {
    randomNumbers = randomNumbers.slice(0, numberCount);
  }

  return randomNumbers;
};

/**
 * Converts a hash string into an array of bytes (integers 0-255).
 * @param {string} hash A SHA256 or SHA512 hash as the seed.
 * @returns {number[]} Array of bytes.
 */
function seedToBytes(hash) {
  const byteArray = [];
  for (let i = 0; i < hash.length; i += 2) {
    const twoBytes = hash.slice(i, i + 2);
    byteArray.push(parseInt(twoBytes, 16));
  }
  return byteArray;
}

/**
 * Converts an array of bytes into normalized numbers (0-1).
 * @param {number[]} byteArr Array of bytes (integers 0-255).
 * @param {number} hashLength Length of the hash (256 or 512 for SHA256 or SHA512).
 * @returns {number[]} Array of normalized numbers (0-1).
 */
function bytesToNumbers(byteArr, hashLength) {
  const chunkSize = 4;
  const numbers = [];

  for (let i = 0; i < byteArr.length; i += chunkSize) {
    const chunk = byteArr.slice(i, i + chunkSize);
    const numA = (chunk[0] || 0) / Math.pow(hashLength, 1);
    const numB = (chunk[1] || 0) / Math.pow(hashLength, 2);
    const numC = (chunk[2] || 0) / Math.pow(hashLength, 3);
    const numD = (chunk[3] || 0) / Math.pow(hashLength, 4);
    numbers.push(numA + numB + numC + numD);
  }

  return numbers;
}

/**
 * Generates an HMAC for the given hash and nonce.
 * @param {string} seedServer The base hash seed.
 * @param {string} salt The nonce value.
 * @returns {string} A new HMAC hash string.
 */
function generateHmac(seedServer, salt) {
  return crypto
    .createHmac("sha256", salt)
    .update(seedServer.toString())
    .digest("hex");
}

module.exports = {
  buildRandomBools,
  generateShuffledGroup,
  buildRandomFloats,
};
