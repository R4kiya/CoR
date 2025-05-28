Hooks.once("init", function () {
  console.log("Champions of Runeterra | Initializing system");

  CONFIG.Actor.documentClass = Actor;

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("cor", ActorSheetCOR, {
    types: ["character"],
    makeDefault: true,
    label: "Champion Sheet"
  });
});

// ✅ Legacy-safe Actor Sheet (works with classic HTML templates)
class ActorSheetCOR extends ActorSheet {
  get template() {
    return "systems/cor/templates/actor-sheet.html";
  }

  getData(options) {
    const data = super.getData(options);
    data.system = this.actor.system;
    return data;
  }
}

// 🎲 Step Dice Mapping
function getDiceFromModifier(mod) {
  if (mod <= -1) return { dice: "1d2", max: 2 };
  if (mod === 0) return { dice: "1d4", max: 4 };
  if (mod === 1) return { dice: "1d6", max: 6 };
  if (mod === 2) return { dice: "1d8", max: 8 };
  if (mod === 3) return { dice: "1d10", max: 10 };
  if (mod === 4) return { dice: "1d12", max: 12 };
  if (mod === 5) return { dice: "2d8", max: 16 };
  if (mod === 6) return { dice: "3d6", max: 18 };
  if (mod >= 7) return { dice: "5d4", max: 20 };
  return { dice: "1d4", max: 4 };
}

// 🔁 Recalculate derived stats after actor is updated
Hooks.on("updateActor", async (actor, diff, options, userId) => {
  if (!game.user.isGM && game.user.id !== userId) return;

  const powerMod = actor.system.attributes?.power?.modifier ?? 0;
  const speedMod = actor.system.attributes?.speed?.modifier ?? 0;
  const magicMod = actor.system.attributes?.magic?.modifier ?? 0;

  const diceP = getDiceFromModifier(powerMod);
  const diceS = getDiceFromModifier(speedMod);
  const diceM = getDiceFromModifier(magicMod);

  const ap = Math.floor(speedMod + (magicMod / 2) + (powerMod / 2) + 2);
  const mv = Math.floor((speedMod / 2) + (powerMod / 2) + 4);
  const rng = Math.floor((diceS.max / 2) + powerMod + magicMod);

  // Delay update slightly to prevent sheet conflict
  setTimeout(() => {
    actor.update({
      "system.attributes.power.dice": diceP.dice,
      "system.attributes.power.diceMax": diceP.max,
      "system.attributes.speed.dice": diceS.dice,
      "system.attributes.speed.diceMax": diceS.max,
      "system.attributes.magic.dice": diceM.dice,
      "system.attributes.magic.diceMax": diceM.max,
      "system.actionPoints.max": ap,
      "system.movement": mv,
      "system.ranges.base": rng
    });
  }, 50);
});
