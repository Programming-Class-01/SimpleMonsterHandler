interface ICreature {
    id: number,
    name: string,
    type: string,
    hunger: {
        fullness: number,
        satiation: number
    }
}

interface ISpecies {
    speciesName: string
}

export { ICreature, ISpecies }