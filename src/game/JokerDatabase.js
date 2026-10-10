/**
 * JokerDatabase.js
 * Complete roster of all 150 official Balatro Jokers (Commons, Uncommons, Rares, Legendaries)
 * directly sourced from the official Balatro Wiki (https://balatrowiki.org/w/Jokers).
 */

export const ALL_150_JOKERS = [
  {
    id: 'joker',
    name: "Joker",
    cost: 2,
    rarity: 'common',
    icon: '🃏',
    description: "+4 Mult",
    sellValue: 1
  },
  {
    id: 'greedy_joker',
    name: "Greedy Joker",
    cost: 5,
    rarity: 'common',
    icon: '♦️',
    description: "Played cards with Diamond suit give +3 Mult when scored",
    sellValue: 2
  },
  {
    id: 'lusty_joker',
    name: "Lusty Joker",
    cost: 5,
    rarity: 'common',
    icon: '♥️',
    description: "Played cards with Heart suit give +3 Mult when scored",
    sellValue: 2
  },
  {
    id: 'wrathful_joker',
    name: "Wrathful Joker",
    cost: 5,
    rarity: 'common',
    icon: '♠️',
    description: "Played cards with Spade suit give +3 Mult when scored",
    sellValue: 2
  },
  {
    id: 'gluttonous_joker',
    name: "Gluttonous Joker",
    cost: 5,
    rarity: 'common',
    icon: '♣️',
    description: "Played cards with Club suit give +3 Mult when scored",
    sellValue: 2
  },
  {
    id: 'jolly_joker',
    name: "Jolly Joker",
    cost: 3,
    rarity: 'common',
    icon: '😄',
    description: "+8 Mult if played hand contains a Pair",
    sellValue: 1
  },
  {
    id: 'zany_joker',
    name: "Zany Joker",
    cost: 4,
    rarity: 'common',
    icon: '🤪',
    description: "+12 Mult if played hand contains a Three of a Kind",
    sellValue: 2
  },
  {
    id: 'mad_joker',
    name: "Mad Joker",
    cost: 4,
    rarity: 'common',
    icon: '😡',
    description: "+10 Mult if played hand contains a Two Pair",
    sellValue: 2
  },
  {
    id: 'crazy_joker',
    name: "Crazy Joker",
    cost: 4,
    rarity: 'common',
    icon: '🌀',
    description: "+12 Mult if played hand contains a Straight",
    sellValue: 2
  },
  {
    id: 'droll_joker',
    name: "Droll Joker",
    cost: 4,
    rarity: 'common',
    icon: '🎭',
    description: "+10 Mult if played hand contains a Flush",
    sellValue: 2
  },
  {
    id: 'sly_joker',
    name: "Sly Joker",
    cost: 3,
    rarity: 'common',
    icon: '🦊',
    description: "+50 Chips if played hand contains a Pair",
    sellValue: 1
  },
  {
    id: 'wily_joker',
    name: "Wily Joker",
    cost: 4,
    rarity: 'common',
    icon: '😼',
    description: "+100 Chips if played hand contains a Three of a Kind",
    sellValue: 2
  },
  {
    id: 'clever_joker',
    name: "Clever Joker",
    cost: 4,
    rarity: 'common',
    icon: '💡',
    description: "+80 Chips if played hand contains a Two Pair",
    sellValue: 2
  },
  {
    id: 'devious_joker',
    name: "Devious Joker",
    cost: 4,
    rarity: 'common',
    icon: '😈',
    description: "+100 Chips if played hand contains a Straight",
    sellValue: 2
  },
  {
    id: 'crafty_joker',
    name: "Crafty Joker",
    cost: 4,
    rarity: 'common',
    icon: '🎩',
    description: "+80 Chips if played hand contains a Flush",
    sellValue: 2
  },
  {
    id: 'half_joker',
    name: "Half Joker",
    cost: 5,
    rarity: 'common',
    icon: '🌗',
    description: "+20 Mult if played hand contains 3 or fewer cards",
    sellValue: 2
  },
  {
    id: 'joker_stencil',
    name: "Joker Stencil",
    cost: 8,
    rarity: 'uncommon',
    icon: '📐',
    description: "X1 Mult for each empty Joker slot Joker Stencil included (Currently X1 )",
    sellValue: 4
  },
  {
    id: 'four_fingers',
    name: "Four Fingers",
    cost: 7,
    rarity: 'uncommon',
    icon: '🖐️',
    description: "All Flushes and Straights can be made with 4 cards",
    sellValue: 3
  },
  {
    id: 'mime',
    name: "Mime",
    cost: 5,
    rarity: 'uncommon',
    icon: '🤫',
    description: "Retrigger all card held in hand abilities",
    sellValue: 2
  },
  {
    id: 'credit_card',
    name: "Credit Card",
    cost: 1,
    rarity: 'common',
    icon: '💳',
    description: "Go up to -$20 in debt",
    sellValue: 1
  },
  {
    id: 'ceremonial_dagger',
    name: "Ceremonial Dagger",
    cost: 6,
    rarity: 'uncommon',
    icon: '🗡️',
    description: "When Blind is selected, destroy Joker to the right and permanently add double its sell value to this Mult (Currently +0 Mult )",
    sellValue: 3
  },
  {
    id: 'banner',
    name: "Banner",
    cost: 5,
    rarity: 'common',
    icon: '🚩',
    description: "+30 Chips for each remaining discard",
    sellValue: 2
  },
  {
    id: 'mystic_summit',
    name: "Mystic Summit",
    cost: 5,
    rarity: 'common',
    icon: '🏔️',
    description: "+15 Mult when 0 discards remaining",
    sellValue: 2
  },
  {
    id: 'marble_joker',
    name: "Marble Joker",
    cost: 6,
    rarity: 'uncommon',
    icon: '🏛️',
    description: "Adds one Stone card to the deck when Blind is selected",
    sellValue: 3
  },
  {
    id: 'loyalty_card',
    name: "Loyalty Card",
    cost: 5,
    rarity: 'uncommon',
    icon: '🎟️',
    description: "X4 Mult every 6 hands played 5 remaining",
    sellValue: 2
  },
  {
    id: '8_ball',
    name: "8 Ball",
    cost: 5,
    rarity: 'common',
    icon: '🎱',
    description: "1 in 4 chance for each played 8 to create a Tarot card when scored (Must have room)",
    sellValue: 2
  },
  {
    id: 'misprint',
    name: "Misprint",
    cost: 4,
    rarity: 'common',
    icon: '🖨️',
    description: "+0-23 Mult",
    sellValue: 2
  },
  {
    id: 'dusk',
    name: "Dusk",
    cost: 5,
    rarity: 'uncommon',
    icon: '🌇',
    description: "Retrigger all played cards in final hand of the round",
    sellValue: 2
  },
  {
    id: 'raised_fist',
    name: "Raised Fist",
    cost: 5,
    rarity: 'common',
    icon: '✊',
    description: "Adds double the rank of lowest ranked card held in hand to Mult",
    sellValue: 2
  },
  {
    id: 'chaos_the_clown',
    name: "Chaos the Clown",
    cost: 4,
    rarity: 'common',
    icon: '🤡',
    description: "1 free Reroll per shop",
    sellValue: 2
  },
  {
    id: 'fibonacci',
    name: "Fibonacci",
    cost: 8,
    rarity: 'uncommon',
    icon: '🐚',
    description: "Each played Ace , 2 , 3 , 5 , or 8 gives +8 Mult when scored",
    sellValue: 4
  },
  {
    id: 'steel_joker',
    name: "Steel Joker",
    cost: 7,
    rarity: 'uncommon',
    icon: '🔩',
    description: "Gives X0.2 Mult for each Steel Card in your full deck (Currently X1 Mult )",
    sellValue: 3
  },
  {
    id: 'scary_face',
    name: "Scary Face",
    cost: 4,
    rarity: 'common',
    icon: '👹',
    description: "Played face cards give +30 Chips when scored",
    sellValue: 2
  },
  {
    id: 'abstract_joker',
    name: "Abstract Joker",
    cost: 4,
    rarity: 'common',
    icon: '🎨',
    description: "+3 Mult for each Joker card (Currently +0 Mult )",
    sellValue: 2
  },
  {
    id: 'delayed_gratification',
    name: "Delayed Gratification",
    cost: 4,
    rarity: 'common',
    icon: '⏳',
    description: "Earn $2 per discard if no discards are used by end of the round",
    sellValue: 2
  },
  {
    id: 'hack',
    name: "Hack",
    cost: 6,
    rarity: 'uncommon',
    icon: '🪓',
    description: "Retrigger each played 2 , 3 , 4 , or 5",
    sellValue: 3
  },
  {
    id: 'pareidolia',
    name: "Pareidolia",
    cost: 5,
    rarity: 'uncommon',
    icon: '🗿',
    description: "All cards are considered face cards",
    sellValue: 2
  },
  {
    id: 'gros_michel',
    name: "Gros Michel",
    cost: 5,
    rarity: 'common',
    icon: '🍌',
    description: "+15 Mult 1 in 6 chance this card is destroyed at end of round",
    sellValue: 2
  },
  {
    id: 'even_steven',
    name: "Even Steven",
    cost: 4,
    rarity: 'common',
    icon: '⚖️',
    description: "Played cards with even rank give +4 Mult when scored (10, 8, 6, 4, 2)",
    sellValue: 2
  },
  {
    id: 'odd_todd',
    name: "Odd Todd",
    cost: 4,
    rarity: 'common',
    icon: '🎯',
    description: "Played cards with odd rank give +31 Chips when scored (A, 9, 7, 5, 3)",
    sellValue: 2
  },
  {
    id: 'scholar',
    name: "Scholar",
    cost: 4,
    rarity: 'common',
    icon: '🎓',
    description: "Played Aces give +20 Chips and +4 Mult when scored",
    sellValue: 2
  },
  {
    id: 'business_card',
    name: "Business Card",
    cost: 4,
    rarity: 'common',
    icon: '💼',
    description: "Played face cards have a 1 in 2 chance to give $2 when scored",
    sellValue: 2
  },
  {
    id: 'supernova',
    name: "Supernova",
    cost: 5,
    rarity: 'common',
    icon: '🌟',
    description: "Adds the number of times poker hand has been played this run to Mult",
    sellValue: 2
  },
  {
    id: 'ride_the_bus',
    name: "Ride the Bus",
    cost: 6,
    rarity: 'common',
    icon: '🚌',
    description: "This Joker gains +1 Mult per consecutive hand played without a scoring face card (Currently +0 Mult )",
    sellValue: 3
  },
  {
    id: 'space_joker',
    name: "Space Joker",
    cost: 5,
    rarity: 'uncommon',
    icon: '🚀',
    description: "1 in 4 chance to upgrade level of played poker hand",
    sellValue: 2
  },
  {
    id: 'egg',
    name: "Egg",
    cost: 4,
    rarity: 'common',
    icon: '🥚',
    description: "Gains $3 of sell value at end of round",
    sellValue: 2
  },
  {
    id: 'burglar',
    name: "Burglar",
    cost: 6,
    rarity: 'uncommon',
    icon: '🦹',
    description: "When Blind is selected, gain +3 Hands and lose all discards",
    sellValue: 3
  },
  {
    id: 'blackboard',
    name: "Blackboard",
    cost: 6,
    rarity: 'uncommon',
    icon: '⬛',
    description: "X3 Mult if all cards held in hand are Spades or Clubs",
    sellValue: 3
  },
  {
    id: 'runner',
    name: "Runner",
    cost: 5,
    rarity: 'common',
    icon: '🃏',
    description: "Gains +15 Chips if played hand contains a Straight (Currently +0 Chips )",
    sellValue: 2
  },
  {
    id: 'ice_cream',
    name: "Ice Cream",
    cost: 5,
    rarity: 'common',
    icon: '🃏',
    description: "+100 Chips -5 Chips for every hand played",
    sellValue: 2
  },
  {
    id: 'dna',
    name: "DNA",
    cost: 8,
    rarity: 'rare',
    icon: '🃏',
    description: "If first hand of round has only 1 card, add a permanent copy to deck and draw it to hand",
    sellValue: 4
  },
  {
    id: 'splash',
    name: "Splash",
    cost: 3,
    rarity: 'common',
    icon: '🃏',
    description: "Every played card counts in scoring",
    sellValue: 1
  },
  {
    id: 'blue_joker',
    name: "Blue Joker",
    cost: 5,
    rarity: 'common',
    icon: '🃏',
    description: "+2 Chips for each remaining card in deck (Currently +104 Chips )",
    sellValue: 2
  },
  {
    id: 'sixth_sense',
    name: "Sixth Sense",
    cost: 6,
    rarity: 'uncommon',
    icon: '🃏',
    description: "If first hand of round is a single 6 , destroy it and create a Spectral card (Must have room)",
    sellValue: 3
  },
  {
    id: 'constellation',
    name: "Constellation",
    cost: 6,
    rarity: 'uncommon',
    icon: '🌌',
    description: "This Joker gains X0.1 Mult every time a Planet card is used (Currently X1 Mult )",
    sellValue: 3
  },
  {
    id: 'hiker',
    name: "Hiker",
    cost: 5,
    rarity: 'uncommon',
    icon: '🥾',
    description: "Every played card permanently gains +5 Chips when scored",
    sellValue: 2
  },
  {
    id: 'faceless_joker',
    name: "Faceless Joker",
    cost: 4,
    rarity: 'common',
    icon: '👤',
    description: "Earn $5 if 3 or more face cards are discarded at the same time",
    sellValue: 2
  },
  {
    id: 'green_joker',
    name: "Green Joker",
    cost: 4,
    rarity: 'common',
    icon: '🍏',
    description: "+1 Mult per hand played -1 Mult per discard (Currently +0 Mult )",
    sellValue: 2
  },
  {
    id: 'superposition',
    name: "Superposition",
    cost: 4,
    rarity: 'common',
    icon: '⚛️',
    description: "Create a Tarot card if poker hand contains an Ace and a Straight (Must have room)",
    sellValue: 2
  },
  {
    id: 'to_do_list',
    name: "To Do List",
    cost: 4,
    rarity: 'common',
    icon: '📋',
    description: "Earn $4 if poker hand is a [Poker Hand] , poker hand changes at end of round",
    sellValue: 2
  },
  {
    id: 'cavendish',
    name: "Cavendish",
    cost: 4,
    rarity: 'common',
    icon: '🍌',
    description: "X3 Mult 1 in 1000 chance this card is destroyed at the end of round",
    sellValue: 2
  },
  {
    id: 'card_sharp',
    name: "Card Sharp",
    cost: 6,
    rarity: 'uncommon',
    icon: '🃏',
    description: "X3 Mult if played poker hand has already been played this round",
    sellValue: 3
  },
  {
    id: 'red_card',
    name: "Red Card",
    cost: 5,
    rarity: 'common',
    icon: '🟥',
    description: "This Joker gains +3 Mult when any Booster Pack is skipped (Currently +0 Mult )",
    sellValue: 2
  },
  {
    id: 'madness',
    name: "Madness",
    cost: 7,
    rarity: 'uncommon',
    icon: '🌪️',
    description: "When Small Blind or Big Blind is selected, gain X0.5 Mult and destroy a random Joker (Currently X1 Mult )",
    sellValue: 3
  },
  {
    id: 'square_joker',
    name: "Square Joker",
    cost: 4,
    rarity: 'common',
    icon: '⬛',
    description: "This Joker gains +4 Chips if played hand has exactly 4 cards (Currently 0 Chips )",
    sellValue: 2
  },
  {
    id: 's_ance',
    name: "S\u00e9ance",
    cost: 6,
    rarity: 'uncommon',
    icon: '🃏',
    description: "If poker hand is a Straight Flush , create a random Spectral card (Must have room)",
    sellValue: 3
  },
  {
    id: 'riff_raff',
    name: "Riff-Raff",
    cost: 6,
    rarity: 'common',
    icon: '👥',
    description: "When Blind is selected, create 2 Common Jokers (Must have room)",
    sellValue: 3
  },
  {
    id: 'vampire',
    name: "Vampire",
    cost: 7,
    rarity: 'uncommon',
    icon: '🧛',
    description: "This Joker gains X0.1 Mult per scoring Enhanced card played, removes card Enhancement (Currently X1 Mult )",
    sellValue: 3
  },
  {
    id: 'shortcut',
    name: "Shortcut",
    cost: 7,
    rarity: 'uncommon',
    icon: '⚡',
    description: "Allows Straights to be made with gaps of 1 rank (ex: 10 8 6 5 3 )",
    sellValue: 3
  },
  {
    id: 'hologram',
    name: "Hologram",
    cost: 7,
    rarity: 'uncommon',
    icon: '💿',
    description: "This Joker gains X0.25 Mult every time a playing card is added to your deck (Currently X1 Mult )",
    sellValue: 3
  },
  {
    id: 'vagabond',
    name: "Vagabond",
    cost: 8,
    rarity: 'rare',
    icon: '🎒',
    description: "Create a Tarot card if hand is played with $4 or less",
    sellValue: 4
  },
  {
    id: 'baron',
    name: "Baron",
    cost: 8,
    rarity: 'rare',
    icon: '🤴',
    description: "Each King held in hand gives X1.5 Mult",
    sellValue: 4
  },
  {
    id: 'cloud_9',
    name: "Cloud 9",
    cost: 7,
    rarity: 'uncommon',
    icon: '☁️',
    description: "Earn $1 for each 9 in your full deck at end of round (Currently $4 )",
    sellValue: 3
  },
  {
    id: 'rocket',
    name: "Rocket",
    cost: 6,
    rarity: 'uncommon',
    icon: '🚀',
    description: "Earn $1 at end of round. Payout increases by $2 when Boss Blind is defeated",
    sellValue: 3
  },
  {
    id: 'obelisk',
    name: "Obelisk",
    cost: 8,
    rarity: 'rare',
    icon: '🗿',
    description: "This Joker gains X0.2 Mult per consecutive hand played without playing your most played poker hand (Currently X1 Mult )",
    sellValue: 4
  },
  {
    id: 'midas_mask',
    name: "Midas Mask",
    cost: 7,
    rarity: 'uncommon',
    icon: '🎭',
    description: "All played face cards become Gold cards when scored",
    sellValue: 3
  },
  {
    id: 'luchador',
    name: "Luchador",
    cost: 5,
    rarity: 'uncommon',
    icon: '🤼',
    description: "Sell this card to disable the current Boss Blind",
    sellValue: 2
  },
  {
    id: 'photograph',
    name: "Photograph",
    cost: 5,
    rarity: 'common',
    icon: '📷',
    description: "First played face card gives X2 Mult when scored",
    sellValue: 2
  },
  {
    id: 'gift_card',
    name: "Gift Card",
    cost: 6,
    rarity: 'uncommon',
    icon: '🎁',
    description: "Add $1 of sell value to every Joker and Consumable card at end of round",
    sellValue: 3
  },
  {
    id: 'turtle_bean',
    name: "Turtle Bean",
    cost: 6,
    rarity: 'uncommon',
    icon: '🐢',
    description: "+5 hand size, reduces by 1 each round",
    sellValue: 3
  },
  {
    id: 'erosion',
    name: "Erosion",
    cost: 6,
    rarity: 'uncommon',
    icon: '🌊',
    description: "+4 Mult for each card below [the deck's starting size] in your full deck (Currently +0 Mult )",
    sellValue: 3
  },
  {
    id: 'reserved_parking',
    name: "Reserved Parking",
    cost: 6,
    rarity: 'common',
    icon: '🅿️',
    description: "Each face card held in hand has a 1 in 2 chance to give $1",
    sellValue: 3
  },
  {
    id: 'mail_in_rebate',
    name: "Mail-In Rebate",
    cost: 4,
    rarity: 'common',
    icon: '✉️',
    description: "Earn $5 for each discarded [rank] , rank changes every round",
    sellValue: 2
  },
  {
    id: 'to_the_moon',
    name: "To the Moon",
    cost: 5,
    rarity: 'uncommon',
    icon: '🌕',
    description: "Earn an extra $1 of interest for every $5 you have at end of round",
    sellValue: 2
  },
  {
    id: 'hallucination',
    name: "Hallucination",
    cost: 4,
    rarity: 'common',
    icon: '🍄',
    description: "1 in 2 chance to create a Tarot card when any Booster Pack is opened (Must have room)",
    sellValue: 2
  },
  {
    id: 'fortune_teller',
    name: "Fortune Teller",
    cost: 6,
    rarity: 'common',
    icon: '🔮',
    description: "+1 Mult per Tarot card used this run (Currently +0 )",
    sellValue: 3
  },
  {
    id: 'juggler',
    name: "Juggler",
    cost: 4,
    rarity: 'common',
    icon: '🤹',
    description: "+1 hand size",
    sellValue: 2
  },
  {
    id: 'drunkard',
    name: "Drunkard",
    cost: 4,
    rarity: 'common',
    icon: '🍺',
    description: "+1 discard each round",
    sellValue: 2
  },
  {
    id: 'stone_joker',
    name: "Stone Joker",
    cost: 6,
    rarity: 'uncommon',
    icon: '🪨',
    description: "Gives +25 Chips for each Stone Card in your full deck (Currently +0 Chips )",
    sellValue: 3
  },
  {
    id: 'golden_joker',
    name: "Golden Joker",
    cost: 6,
    rarity: 'common',
    icon: '💰',
    description: "Earn $4 at end of round",
    sellValue: 3
  },
  {
    id: 'lucky_cat',
    name: "Lucky Cat",
    cost: 6,
    rarity: 'uncommon',
    icon: '🐱',
    description: "This Joker gains X0.25 Mult every time a Lucky card successfully triggers (Currently X1 Mult )",
    sellValue: 3
  },
  {
    id: 'baseball_card',
    name: "Baseball Card",
    cost: 8,
    rarity: 'rare',
    icon: '⚾',
    description: "Uncommon Jokers each give X1.5 Mult",
    sellValue: 4
  },
  {
    id: 'bull',
    name: "Bull",
    cost: 6,
    rarity: 'uncommon',
    icon: '🐂',
    description: "+2 Chips for each $1 you have (Currently +0 Chips )",
    sellValue: 3
  },
  {
    id: 'diet_cola',
    name: "Diet Cola",
    cost: 6,
    rarity: 'uncommon',
    icon: '🥤',
    description: "Sell this card to create a free Double Tag",
    sellValue: 3
  },
  {
    id: 'trading_card',
    name: "Trading Card",
    cost: 6,
    rarity: 'uncommon',
    icon: '🎴',
    description: "If first discard of round has only 1 card, destroy it and earn $3",
    sellValue: 3
  },
  {
    id: 'flash_card',
    name: "Flash Card",
    cost: 5,
    rarity: 'uncommon',
    icon: '📑',
    description: "This Joker gains +2 Mult per reroll in the shop (Currently +0 Mult )",
    sellValue: 2
  },
  {
    id: 'popcorn',
    name: "Popcorn",
    cost: 5,
    rarity: 'common',
    icon: '🍿',
    description: "+20 Mult -4 Mult per round played",
    sellValue: 2
  },
  {
    id: 'spare_trousers',
    name: "Spare Trousers",
    cost: 6,
    rarity: 'uncommon',
    icon: '👖',
    description: "This Joker gains +2 Mult if played hand contains a Two Pair (Currently +0 Mult )",
    sellValue: 3
  },
  {
    id: 'ancient_joker',
    name: "Ancient Joker",
    cost: 8,
    rarity: 'rare',
    icon: '🏺',
    description: "Each played card with [suit] gives X1.5 Mult when scored, suit changes at end of round",
    sellValue: 4
  },
  {
    id: 'ramen',
    name: "Ramen",
    cost: 6,
    rarity: 'uncommon',
    icon: '🍜',
    description: "X2 Mult , loses X0.01 Mult per card discarded",
    sellValue: 3
  },
  {
    id: 'walkie_talkie',
    name: "Walkie Talkie",
    cost: 4,
    rarity: 'common',
    icon: '📻',
    description: "Each played 10 or 4 gives +10 Chips and +4 Mult when scored",
    sellValue: 2
  },
  {
    id: 'seltzer',
    name: "Seltzer",
    cost: 6,
    rarity: 'uncommon',
    icon: '🫧',
    description: "Retrigger all cards played for the next 10 hands",
    sellValue: 3
  },
  {
    id: 'castle',
    name: "Castle",
    cost: 6,
    rarity: 'uncommon',
    icon: '🏰',
    description: "This Joker gains +3 Chips per discarded [suit] card, suit changes every round (Currently +0 Chips )",
    sellValue: 3
  },
  {
    id: 'smiley_face',
    name: "Smiley Face",
    cost: 4,
    rarity: 'common',
    icon: '😃',
    description: "Played face cards give +5 Mult when scored",
    sellValue: 2
  },
  {
    id: 'campfire',
    name: "Campfire",
    cost: 9,
    rarity: 'rare',
    icon: '🔥',
    description: "This Joker gains X0.25 Mult for each card sold , resets when Boss Blind is defeated (Currently X1 Mult )",
    sellValue: 4
  },
  {
    id: 'golden_ticket',
    name: "Golden Ticket",
    cost: 5,
    rarity: 'common',
    icon: '🎫',
    description: "Played Gold cards earn $4 when scored",
    sellValue: 2
  },
  {
    id: 'mr_bones',
    name: "Mr. Bones",
    cost: 5,
    rarity: 'uncommon',
    icon: '💀',
    description: "Prevents Death if chips scored are at least 25% of required chips self destructs",
    sellValue: 2
  },
  {
    id: 'acrobat',
    name: "Acrobat",
    cost: 6,
    rarity: 'uncommon',
    icon: '🎪',
    description: "X3 Mult on final hand of round",
    sellValue: 3
  },
  {
    id: 'sock_and_buskin',
    name: "Sock and Buskin",
    cost: 6,
    rarity: 'uncommon',
    icon: '🎭',
    description: "Retrigger all played face cards",
    sellValue: 3
  },
  {
    id: 'swashbuckler',
    name: "Swashbuckler",
    cost: 4,
    rarity: 'common',
    icon: '⚔️',
    description: "Adds the sell value of all other owned Jokers to Mult (Currently +1 Mult )",
    sellValue: 2
  },
  {
    id: 'troubadour',
    name: "Troubadour",
    cost: 6,
    rarity: 'uncommon',
    icon: '🎵',
    description: "+2 hand size, -1 hand each round",
    sellValue: 3
  },
  {
    id: 'certificate',
    name: "Certificate",
    cost: 6,
    rarity: 'uncommon',
    icon: '📜',
    description: "When round begins, add a random playing card with a random seal to your hand",
    sellValue: 3
  },
  {
    id: 'smeared_joker',
    name: "Smeared Joker",
    cost: 7,
    rarity: 'uncommon',
    icon: '🖌️',
    description: "Hearts and Diamonds count as the same suit, Spades and Clubs count as the same suit",
    sellValue: 3
  },
  {
    id: 'throwback',
    name: "Throwback",
    cost: 6,
    rarity: 'uncommon',
    icon: '⏪',
    description: "X0.25 Mult for each Blind skipped this run (Currently X1 Mult )",
    sellValue: 3
  },
  {
    id: 'hanging_chad',
    name: "Hanging Chad",
    cost: 4,
    rarity: 'common',
    icon: '🗳️',
    description: "Retrigger first played card used in scoring 2 additional times",
    sellValue: 2
  },
  {
    id: 'rough_gem',
    name: "Rough Gem",
    cost: 7,
    rarity: 'uncommon',
    icon: '💎',
    description: "Played cards with Diamond suit earn $1 when scored",
    sellValue: 3
  },
  {
    id: 'bloodstone',
    name: "Bloodstone",
    cost: 7,
    rarity: 'uncommon',
    icon: '🩸',
    description: "1 in 2 chance for played cards with Heart suit to give X1.5 Mult when scored",
    sellValue: 3
  },
  {
    id: 'arrowhead',
    name: "Arrowhead",
    cost: 7,
    rarity: 'uncommon',
    icon: '🏹',
    description: "Played cards with Spade suit give +50 Chips when scored",
    sellValue: 3
  },
  {
    id: 'onyx_agate',
    name: "Onyx Agate",
    cost: 7,
    rarity: 'uncommon',
    icon: '🖤',
    description: "Played cards with Club suit give +7 Mult when scored",
    sellValue: 3
  },
  {
    id: 'glass_joker',
    name: "Glass Joker",
    cost: 6,
    rarity: 'uncommon',
    icon: '🥛',
    description: "This Joker gains X0.75 Mult for every Glass Card that is destroyed (Currently X1 Mult )",
    sellValue: 3
  },
  {
    id: 'showman',
    name: "Showman",
    cost: 5,
    rarity: 'uncommon',
    icon: '🎪',
    description: "Joker , Tarot , Planet , and Spectral cards may appear multiple times",
    sellValue: 2
  },
  {
    id: 'flower_pot',
    name: "Flower Pot",
    cost: 6,
    rarity: 'uncommon',
    icon: '🪴',
    description: "X3 Mult if poker hand contains a Diamond card, Club card, Heart card, and Spade card",
    sellValue: 3
  },
  {
    id: 'blueprint',
    name: "Blueprint",
    cost: 10,
    rarity: 'rare',
    icon: '📐',
    description: "Copies ability of Joker to the right",
    sellValue: 5
  },
  {
    id: 'wee_joker',
    name: "Wee Joker",
    cost: 8,
    rarity: 'rare',
    icon: '👶',
    description: "This Joker gains +8 Chips when each played 2 is scored (Currently +0 Chips )",
    sellValue: 4
  },
  {
    id: 'merry_andy',
    name: "Merry Andy",
    cost: 7,
    rarity: 'uncommon',
    icon: '🎠',
    description: "+3 discards each round, -1 hand size",
    sellValue: 3
  },
  {
    id: 'oops_all_6s',
    name: "Oops! All 6s",
    cost: 4,
    rarity: 'uncommon',
    icon: '🎲',
    description: "Doubles all listed probabilities (ex: 1 in 3 -&gt; 2 in 3 )",
    sellValue: 2
  },
  {
    id: 'the_idol',
    name: "The Idol",
    cost: 6,
    rarity: 'uncommon',
    icon: '🗿',
    description: "Each played [rank] of [suit] gives X2 Mult when scored Card changes every round",
    sellValue: 3
  },
  {
    id: 'seeing_double',
    name: "Seeing Double",
    cost: 6,
    rarity: 'uncommon',
    icon: '👀',
    description: "X2 Mult if played hand has a scoring Club card and a scoring card of any other suit",
    sellValue: 3
  },
  {
    id: 'matador',
    name: "Matador",
    cost: 7,
    rarity: 'uncommon',
    icon: '🐂',
    description: "Earn $8 if played hand triggers the Boss Blind ability",
    sellValue: 3
  },
  {
    id: 'hit_the_road',
    name: "Hit the Road",
    cost: 8,
    rarity: 'rare',
    icon: '🛣️',
    description: "This Joker gains X0.5 Mult for every Jack discarded this round (Currently X1 Mult )",
    sellValue: 4
  },
  {
    id: 'the_duo',
    name: "The Duo",
    cost: 8,
    rarity: 'rare',
    icon: '👥',
    description: "X2 Mult if played hand contains a Pair",
    sellValue: 4
  },
  {
    id: 'the_trio',
    name: "The Trio",
    cost: 8,
    rarity: 'rare',
    icon: '🔱',
    description: "X3 Mult if played hand contains a Three of a Kind",
    sellValue: 4
  },
  {
    id: 'the_family',
    name: "The Family",
    cost: 8,
    rarity: 'rare',
    icon: '👨‍👩‍👧',
    description: "X4 Mult if played hand contains a Four of a Kind",
    sellValue: 4
  },
  {
    id: 'the_order',
    name: "The Order",
    cost: 8,
    rarity: 'rare',
    icon: '🎖️',
    description: "X3 Mult if played hand contains a Straight",
    sellValue: 4
  },
  {
    id: 'the_tribe',
    name: "The Tribe",
    cost: 8,
    rarity: 'rare',
    icon: '⛺',
    description: "X2 Mult if played hand contains a Flush",
    sellValue: 4
  },
  {
    id: 'stuntman',
    name: "Stuntman",
    cost: 7,
    rarity: 'rare',
    icon: '🤸',
    description: "+250 Chips , -2 hand size",
    sellValue: 3
  },
  {
    id: 'invisible_joker',
    name: "Invisible Joker",
    cost: 8,
    rarity: 'rare',
    icon: '👻',
    description: "After 2 rounds, sell this card to Duplicate a random Joker (Currently 0 /2) (Removes Negative from copy)",
    sellValue: 4
  },
  {
    id: 'brainstorm',
    name: "Brainstorm",
    cost: 10,
    rarity: 'rare',
    icon: '🧠',
    description: "Copies the ability of leftmost Joker",
    sellValue: 5
  },
  {
    id: 'satellite',
    name: "Satellite",
    cost: 6,
    rarity: 'uncommon',
    icon: '🛰️',
    description: "Earn $1 at end of round per unique Planet card used this run",
    sellValue: 3
  },
  {
    id: 'shoot_the_moon',
    name: "Shoot the Moon",
    cost: 5,
    rarity: 'common',
    icon: '🌙',
    description: "Each Queen held in hand gives +13 Mult",
    sellValue: 2
  },
  {
    id: 'driver_s_license',
    name: "Driver's License",
    cost: 7,
    rarity: 'rare',
    icon: '🪪',
    description: "X3 Mult if you have at least 16 Enhanced cards in your full deck (Currently 0 )",
    sellValue: 3
  },
  {
    id: 'cartomancer',
    name: "Cartomancer",
    cost: 6,
    rarity: 'uncommon',
    icon: '🃏',
    description: "Create a Tarot card when Blind is selected (Must have room)",
    sellValue: 3
  },
  {
    id: 'astronomer',
    name: "Astronomer",
    cost: 8,
    rarity: 'uncommon',
    icon: '🔭',
    description: "All Planet cards and Celestial Packs in the shop are free",
    sellValue: 4
  },
  {
    id: 'burnt_joker',
    name: "Burnt Joker",
    cost: 8,
    rarity: 'rare',
    icon: '🔥',
    description: "Upgrade the level of the first discarded poker hand each round",
    sellValue: 4
  },
  {
    id: 'bootstraps',
    name: "Bootstraps",
    cost: 7,
    rarity: 'uncommon',
    icon: '👢',
    description: "+2 Mult for every $5 you have (Currently +0 Mult )",
    sellValue: 3
  },
  {
    id: 'canio',
    name: "Canio",
    cost: 20,
    rarity: 'legendary',
    icon: '🃏',
    description: "This Joker gains X1 Mult when a face card is destroyed (Currently X1 Mult )",
    sellValue: 10
  },
  {
    id: 'triboulet',
    name: "Triboulet",
    cost: 20,
    rarity: 'legendary',
    icon: '🃏',
    description: "Played Kings and Queens each give X2 Mult when scored",
    sellValue: 10
  },
  {
    id: 'yorick',
    name: "Yorick",
    cost: 20,
    rarity: 'legendary',
    icon: '💀',
    description: "This Joker gains X1 Mult every 23 [23] cards discarded (Currently X1 Mult )",
    sellValue: 10
  },
  {
    id: 'chicot',
    name: "Chicot",
    cost: 20,
    rarity: 'legendary',
    icon: '🤡',
    description: "Disables effect of every Boss Blind",
    sellValue: 10
  },
  {
    id: 'perkeo',
    name: "Perkeo",
    cost: 20,
    rarity: 'legendary',
    icon: '✨',
    description: "Creates a Negative copy of 1 random consumable card in your possession at the end of the shop",
    sellValue: 10
  },
];
