import { Player } from '../Entity';
import { Game } from '../Game';

export type IEvent = {
  id: string;
  row: [number, number];
  col: [number, number];
  eventHandler: (player: Player) => void;
  onLeave?: () => void;
};

export type IEventsManagerConfig = (game: Game) => IEvent[];

class EventManager {
  events: IEvent[];
  currentEvent: IEvent;

  constructor(events: IEventsManagerConfig, game: Game) {
    this.events = events(game);
    this.currentEvent = null;
  }

  checkEvent(player: Player) {
    const nextEvent = this.events.find(
      (event) =>
        player.row >= event.row[0] &&
        player.row <= event.row[1] &&
        player.col >= event.col[0] &&
        player.col <= event.col[1]
    );

    if (!this.currentEvent && nextEvent) {
      this.currentEvent = nextEvent;
      this.currentEvent.eventHandler(player);
    } else if (this.currentEvent && nextEvent) {
      if (nextEvent.id !== this.currentEvent.id) {
        this.currentEvent.onLeave && this.currentEvent.onLeave();
        this.currentEvent = nextEvent;
        this.currentEvent.eventHandler(player);
      }
    } else if (this.currentEvent && !nextEvent) {
      this.currentEvent.onLeave && this.currentEvent.onLeave();
      this.currentEvent = null;
    }
  }
}

export default EventManager;
