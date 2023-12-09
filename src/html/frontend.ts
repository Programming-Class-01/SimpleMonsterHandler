async function updateField(id: string, value: string): Promise<void> {
    let element = document.getElementById(id);
    if (!element) {
        console.error(`Could not find ${id}.`);
    } else {
        element.innerHTML = value;
    }
}
//@ts-expect-error
async function showCreature(): Promise<void>  {
    const response = await fetch("http://localhost:${port}/api/createCreature");
    const creature = await response.json();
    updateField("creatureName", creature.value.name);
    updateField("creatureType", creature.value.type);
    updateField("creatureHunger", creature.value.hunger);
}