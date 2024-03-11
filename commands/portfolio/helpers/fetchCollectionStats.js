module.exports = async function fetchCollectionStats(symbol) {

  try {
      const response = await fetch(`https://api-mainnet.magiceden.dev/v2/collections/${symbol}/stats`);
      const data = await response.json();
  
      if (data && data.floorPrice) {
        const floorPrice = data.floorPrice;
        return floorPrice;
      } else {
        return 0;
      }
    } catch (error) {
      return 0;
    }
}