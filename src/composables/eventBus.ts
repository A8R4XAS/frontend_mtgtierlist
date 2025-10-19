import mitt from 'mitt';

type Events = {
  'game:created': void;
  'rating:submitted': void;
  'data:refresh': void;
  'deck:created': void;  // Event wenn ein neues Deck erstellt wurde
};

export const eventBus = mitt<Events>();
