const ALL_ICON_IDS = [
  'dog','cat','rabbit','fox','bear','panda',
  'tiger','lion','cow','pig','frog','monkey',
  'chicken','penguin','owl','eagle','dolphin',
  'shark','turtle','butterfly','apple','grapes',
  'watermelon','banana','strawberry','pizza',
  'burger','cake','coffee','icecream','donut',
  'taco','sushi','cookie','lemon','sunflower',
  'rose','tulip','tree','cactus','mushroom',
  'fire','snowflake','rainbow','star','moon',
  'sun','lightning','wave','mountain','diamond',
  'crown','rocket','trophy','guitar','camera',
  'compass','shield','key','lock','bell',
  'book','globe','magnet','microscope','soccer',
  'basketball','tennis','baseball','football',
  'car','airplane','train','bicycle','ship',
  'heart','blueheart','greenheart',
  'yellowheart','purpleheart'
];

function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function generateGrid(secretIconIds) {
  // secretIconIds = array of icon label IDs
  // e.g. ['dog', 'apple', 'rose', 'key', 'car']
  
  // Get decoy icons (exclude secret ones)
  const available = ALL_ICON_IDS.filter(id => 
    !secretIconIds.includes(id)
  );
  
  // Pick 20 random decoys
  const shuffledAvailable = shuffleArray(available);
  const decoys = shuffledAvailable.slice(0, 20);
  
  // Combine secret + decoys = 25 total
  const allItems = [...secretIconIds, ...decoys];
  
  // Shuffle all 25
  const shuffled = shuffleArray(allItems);
  
  // Return array of 25 objects
  return shuffled.map((iconId, index) => ({
    id: index,
    emoji: iconId,          // icon label ID
    isSecret: secretIconIds.includes(iconId),
    position: index,
    row: Math.floor(index / 5),
    col: index % 5
  }));
}

module.exports = { generateGrid, ALL_ICON_IDS };
