import mitt from 'mitt';

type Events = {
  'game:created': void;
  'rating:submitted': void;
  'data:refresh': void;
};

export const eventBus = mitt<Events>();
