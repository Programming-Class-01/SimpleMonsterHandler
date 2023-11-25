interface ICreature {
    id: number,
    name: string,
    type: string,
    hunger: {
        fullness: number,
        satiation: number
    }
    hungerHandler: () => void,
}

interface ISpecies {
    speciesName: string
}

interface IFood{
    foodName: string,

}





export { ICreature, ISpecies, IFood }
