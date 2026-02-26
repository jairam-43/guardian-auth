const { supabaseAdmin } = require('./supabase');

const ALL_EMOJIS = [
  // ANIMALS
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋', '🐌', '🐞', '🐜', '🦟', '🦗', '🕷', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐈', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦫', '🦦', '🦥', '🐁', '🐀', '🐿', '🦔',
  
  // FOOD & DRINKS
  '🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝', '🍅', '🍆', '🥑', '🥦', '🥬', '🥒', '🌶', '🫑', '🧄', '🧅', '🥔', '🍠', '🥐', '🥯', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕', '🫓', '🥪', '🥙', '🧆', '🌮', '🌯', '🫔', '🥗', '🥘', '🫕', '🍜', '🍝', '🍛', '🍣', '🍱', '🥟', '🦪', '🍤', '🍙', '🍚', '🍘', '🍥', '🥮', '🍢', '🧁', '🍰', '🎂', '🍮', '🍭', '🍬', '🍫', '🍿', '🍩', '🍪', '🌰', '🥜', '🍯', '🧃', '🥤', '🧋', '☕', '🍵', '🫖', '🍺', '🍻', '🥂', '🍷', '🥃', '🍸', '🍹', '🧉', '🍾',
  
  // NATURE & WEATHER
  '🌸', '🌺', '🌻', '🌹', '🌷', '🌼', '💐', '🍄', '🌿', '🍀', '🍁', '🍂', '🍃', '🌱', '🌲', '🌳', '🌴', '🌵', '🎋', '🎍', '🪴', '🌾', '🌊', '🌬', '🌀', '🌈', '⚡', '🔥', '💧', '🌙', '⭐', '🌟', '💫', '✨', '☀️', '🌤', '⛅', '🌦', '🌧', '⛈', '🌩', '🌨', '❄️', '☃️', '⛄', '🌪', '🌫', '🌁', '🌋', '🏔', '⛰', '🗻', '🏕', '🏖', '🏜', '🏝', '🌍', '🌎', '🌏', '🪐', '🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘',
  
  // OBJECTS & TOOLS
  '⌚', '📱', '💻', '🖥', '🖨', '⌨️', '🖱', '🖲', '💾', '💿', '📷', '📸', '📹', '🎥', '📞', '☎️', '📟', '📠', '📺', '📻', '🎙', '🎚', '🎛', '🧭', '⏱', '⏰', '⌛', '⏳', '📡', '🔋', '🔌', '💡', '🔦', '🕯', '🪔', '🧲', '🔭', '🔬', '🩺', '💊', '🩹', '🩻', '🧸', '🪆', '🪅', '🎭', '🎨', '🖼', '🎪', '🎠', '🎡', '🎢', '🎟', '🔑', '🗝', '🔐', '🔒', '🔓', '🔨', '🪓', '⛏', '⚒', '🛠', '🗡', '⚔️', '🛡', '🪚', '🔧', '🪛', '🔩', '⚙️', '🗜', '⚖️', '🦯', '🔗', '⛓', '🪝', '🧲', '🪜', '🧰',
  
  // SPORTS & ACTIVITIES
  '⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🥅', '🎿', '🛷', '🥌', '🎯', '🎳', '🏹', '🎣', '🤿', '🎽', '🛹', '🛼', '🛷', '🎖', '🏆', '🥇', '🥈', '🥉', '🏅', '🎗', '🎫', '🎟', '🤸', '🏋️', '🤼', '🤺', '🤾', '🏇', '⛷', '🏂', '🪂', '🏄', '🚣', '🧗', '🚵', '🚴', '🏊', '🤽',
  
  // TRAVEL & PLACES
  '🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🏍', '🛵', '🛺', '🚲', '🛴', '🛹', '🛼', '🚏', '🛣', '🛤', '✈️', '🛫', '🛬', '🛩', '💺', '🚁', '🚟', '🚠', '🚡', '🛰', '🚀', '🛸', '🪂', '⛵', '🚤', '🛥', '🛳', '⛴', '🚢', '⚓', '🪝', '⛽', '🚧', '🚦', '🚥', '🗺', '🧳', '🌂', '☂️', '🧵', '🪡', '🧶', '🪢',
  
  // SYMBOLS & MISC
  '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '💯', '💢', '💥', '💫', '💦', '💨', '🕳', '💬', '💭', '💤', '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪', '🟤', '🔶', '🔷', '🔸', '🔹', '🔺', '🔻', '💠', '🔘', '🔲', '🔳', '▪️', '▫️', '◾', '◽', '◼️', '◻️', '🟥', '🟧', '🟨', '🟩', '🟦', '🟪', '⬛', '⬜', '🟫'
];

async function getRandomRule() {
  const { data, error } = await supabaseAdmin
    .from('dppg_rules')
    .select('*')
    .eq('is_active', true);
  
  if (error || !data || data.length === 0) {
    return {
      id: 1,
      rule_name: 'sequential',
      rule_description: 'Select in order',
      rule_pattern: 'sequential',
      is_active: true
    };
  }
  
  const randomIndex = Math.floor(Math.random() * data.length);
  return data[randomIndex];
}

function applyRule(rulePattern, secretImages) {
  switch (rulePattern) {
    case 'sequential':
      return {
        expected: secretImages,
        instruction: 'Select your secret images in the order you chose them'
      };
    case 'reverse':
      return {
        expected: [...secretImages].reverse(),
        instruction: 'Select your secret images in REVERSE order'
      };
    case 'diagonal':
      return {
        expected: [secretImages[0], secretImages[secretImages.length - 1]],
        instruction: 'Select only your FIRST and LAST secret image'
      };
    case 'alternate':
      return {
        expected: secretImages.filter((_, index) => index % 2 === 0),
        instruction: 'Select every ALTERNATE secret image (1st, 3rd, 5th)'
      };
    case 'shift_right':
      return {
        expected: secretImages.map((img, index) => 
          secretImages[(index + 1) % secretImages.length]
        ),
        instruction: 'Select the image AFTER each of your secret images'
      };
    default:
      return {
        expected: secretImages,
        instruction: 'Select your secret images in the order you chose them'
      };
  }
}

function getRuleInstruction(rulePattern) {
  const instructions = {
    'sequential': 'Select your secret images in the order you chose them',
    'reverse': 'Select your secret images in REVERSE order',
    'diagonal': 'Select only your FIRST and LAST secret image',
    'alternate': 'Select every ALTERNATE secret image (1st, 3rd, 5th)',
    'shift_right': 'Select the image AFTER each of your secret images'
  };
  return instructions[rulePattern] || instructions['sequential'];
}

module.exports = {
  ALL_EMOJIS,
  getRandomRule,
  applyRule,
  getRuleInstruction
};
