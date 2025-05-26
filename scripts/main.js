Hooks.once("init", function () {
    console.log("Champions of Runeterra | Initializing system");
  
    // Define a custom actor sheet class (optional for now)
    CONFIG.Actor.documentClass = Actor;
  
    // Register your custom sheet for character type
    Actors.unregisterSheet("core", ActorSheet); // Unregister default
    Actors.registerSheet("cor", ActorSheetCOR, {
      types: ["character"],
      makeDefault: true
    });
  });
  
  // Create a simple sheet class extending Foundry's base
  class ActorSheetCOR extends ActorSheet {
    get template() {
      return "systems/cor/templates/actor-sheet.html";
    }
  
    async getData() {
        const data = await super.getData();
        return data;
      }      
  }
  
  // Auto-calculate Action Points on actor update
  Hooks.on("preUpdateActor", async (actor, updateData, options, userId) => {
    const data = actor.system;
  
    const power = data.attributes?.power?.modifier ?? 0;
    const speed = data.attributes?.speed?.modifier ?? 0;
    const magic = data.attributes?.magic?.modifier ?? 0;
    const specialization = (data.specialization || "").toLowerCase();
  
    let calculatedAP = 1;
  
    if (specialization === "speed") {
      calculatedAP = Math.floor(power + magic + speed * 1.5);
    } else {
      calculatedAP = power + speed + magic;
    }
  
    // Write the new AP max into the update payload
    updateData.system = updateData.system || {};
    updateData.system.actionPoints = {
      ...data.actionPoints,
      max: calculatedAP
    };
  });
  