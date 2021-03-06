import { GameCommand } from "./game.command";
import { Player } from "../models/player.model";
import { GameState } from "../models/game-state.model";
import { CommandValidation } from "./command-result";
import { AfterTakeCardsEvent } from "../events/after-take-cards.event";
import { AfterYellUnoEvent } from "../events/after-yell-uno.event";

export class YellUnoCommand extends GameCommand {
  private readonly yeller?: Player;

  constructor(yeller?: Player) {
    super();

    this.yeller = yeller;
  }

  execute(state: GameState) {
    const yeller = this.yeller || (state.turn.player as Player);

    // es posible que el jugador tenga 2 cartas al momento de gritar UNO!
    if (yeller.hand.cards.length <= 2 && !state.unoYellers[yeller.id]) {
      // si no grito antes entonces lo marca como que grito
      state.unoYellers[yeller.id] = true;

      console.log(`El jugador ${yeller.name} ha gritado UNO!`);

      this.events.dispatchAfterYellUno(new AfterYellUnoEvent(yeller));
    } else {
      // si tiene mas de 2 cartas o ya habia gritado
      // entonces debemos validar que no haya mentido

      if (yeller.hand.cards.length > 2) {
        const newCards = state.giveCards(2, yeller);

        this.events.dispatchAfterTakeCards(
          new AfterTakeCardsEvent(newCards, yeller)
        );
      }
    }
  }

  validate(state: GameState) {
    return new CommandValidation(true);
  }
}
