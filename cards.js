
let {CARDS,CARDS_POINTS,CARD_SUIT} = require(`./app/utils/constants`);
let cards = {};
cards.suitPriorities=[
    {
      suit:CARD_SUIT.CLUB,
      priorities:[{suit:CARD_SUIT.CLUB,suitPriority:4},{suit:CARD_SUIT.SPADE,suitPriority:3},{suit:CARD_SUIT.HEART,suitPriority:2},{suit:CARD_SUIT.DIAMOND,suitPriority:1}]
    },
    {
      suit:CARD_SUIT.SPADE,
      priorities:[{suit:CARD_SUIT.SPADE,suitPriority:4},{suit:CARD_SUIT.HEART,suitPriority:3},{suit:CARD_SUIT.DIAMOND,suitPriority:2},{suit:CARD_SUIT.CLUB,suitPriority:1}]
    },
    {
      suit:CARD_SUIT.HEART,
      priorities:[{suit:CARD_SUIT.HEART,suitPriority:4},{suit:CARD_SUIT.DIAMOND,suitPriority:3},{suit:CARD_SUIT.CLUB,suitPriority:2},{suit:CARD_SUIT.SPADE,suitPriority:1}]
    },{
      suit:CARD_SUIT.DIAMOND,
      priorities:[{suit:CARD_SUIT.DIAMOND,suitPriority:4},{suit:CARD_SUIT.CLUB,suitPriority:3},{suit:CARD_SUIT.SPADE,suitPriority:2},{suit:CARD_SUIT.HEART,suitPriority:1}]
    }
  ];

  cards.cards=[
        { card:CARDS.SEVEN, suit: CARD_SUIT.DIAMOND },                                  //101 for club    //102 for spade   //103 for heart   //104 for diamond 
        { card: CARDS.SEVEN, suit: CARD_SUIT.HEART },
        { card: CARDS.SEVEN, suit: CARD_SUIT.SPADE },
        { card: CARDS.SEVEN, suit: CARD_SUIT.CLUB },
        { card: CARDS.EIGHT, suit: CARD_SUIT.DIAMOND },
        { card: CARDS.EIGHT, suit: CARD_SUIT.HEART},
        { card: CARDS.EIGHT, suit: CARD_SUIT.SPADE },
        { card: CARDS.EIGHT, suit: CARD_SUIT.CLUB },
        { card: CARDS.NINE, suit: CARD_SUIT.DIAMOND},
        { card: CARDS.NINE, suit: CARD_SUIT.HEART },
        { card: CARDS.NINE, suit: CARD_SUIT.SPADE },
        { card: CARDS.NINE, suit: CARD_SUIT.CLUB},
        { card: CARDS.QUEEN, suit: CARD_SUIT.DIAMOND },
        { card: CARDS.QUEEN, suit: CARD_SUIT.HEART},
        { card: CARDS.QUEEN, suit: CARD_SUIT.SPADE},
        { card: CARDS.QUEEN, suit: CARD_SUIT.CLUB},
        { card: CARDS.KING, suit: CARD_SUIT.DIAMOND },
        { card: CARDS.KING, suit: CARD_SUIT.HEART },
        { card: CARDS.KING, suit: CARD_SUIT.SPADE },
        { card: CARDS.KING, suit: CARD_SUIT.CLUB },
        { card: CARDS.TEN, suit: CARD_SUIT.DIAMOND },
        { card: CARDS.TEN, suit: CARD_SUIT.HEART},
        { card: CARDS.TEN, suit: CARD_SUIT.SPADE },
        { card: CARDS.TEN, suit: CARD_SUIT.CLUB},
        { card: CARDS.ACE, suit: CARD_SUIT.DIAMOND },
        { card: CARDS.ACE, suit: CARD_SUIT.HEART },
        { card: CARDS.ACE, suit: CARD_SUIT.SPADE},
        { card: CARDS.ACE, suit: CARD_SUIT.CLUB},
        { card: CARDS.JACK, suit: CARD_SUIT.DIAMOND },
        { card: CARDS.JACK, suit: CARD_SUIT.HEART},
        { card: CARDS.JACK, suit: CARD_SUIT.SPADE },
        { card: CARDS.JACK, suit: CARD_SUIT.CLUB }
    ];

    cards.cardsPrioriotyAndPoints = [
        { card:CARDS.SEVEN ,points: CARDS_POINTS.SEVEN, cardPriority: 1 },                                  //101 for club    //102 for spade   //103 for heart   //104 for diamond         { card: CARDS.EIGHT, suit: CARD_SUIT.HEART, points: CARDS_POINTS.EIGHT, cardPriority: 2 },
        { card: CARDS.EIGHT, points: CARDS_POINTS.EIGHT, cardPriority: 2 },
        { card: CARDS.NINE, points: CARDS_POINTS.NINE, cardPriority: 3, },
        { card: CARDS.QUEEN, points: CARDS_POINTS.QUEEN, cardPriority: 4 },
        { card: CARDS.KING, points: CARDS_POINTS.KING, cardPriority: 5 },
        { card: CARDS.TEN, points: CARDS_POINTS.TEN, cardPriority: 6 },
        { card: CARDS.ACE, points: CARDS_POINTS.ACE, cardPriority: 7 },
        { card: CARDS.JACK,  points: CARDS_POINTS.JACK, cardPriority: 8 }
    ];

module.exports = cards;