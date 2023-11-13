import Express from 'express'
import { ICreature, ISpecies } from './interfaces.js';
import { Result, Ok, Err } from "ts-results-es";
const app = Express();

const port = 8080;

const myResponse = {
    port: port
};
let globalCreatureMap = new Map<Number, ICreature>();

app.get("/", (_request, response) => {
    response.send(`Hey, I started a server on ${port}!`);
})

app.get("/api/port", (_resquest, response) => {
    response.setHeader("Content-Type", "application/json");
    response.send(JSON.stringify(myResponse));
})

app.get("/api/getCreature", getCreature);
app.get("/api/createCreature", createCreature);

app.listen(port, () => {
    console.log(`Server started on port: http://localhost:${port}`);
})

function getCreature(request: Express.Request, response: Express.Response): void {
    const incomingID = request.query.id;
    if (!incomingID) {
        response.sendStatus(400);
        console.log(`No ID provided`);
        return;
    }
    if (typeof Number(incomingID) !== 'number') {
        response.sendStatus(400);
        console.log(`Incoming ID is not a number: ${incomingID}`);
        return;
    }
    const creature = getCreatureByID(Number(incomingID), globalCreatureMap);
    if (creature.isErr()) {
        response.sendStatus(400);
        console.log(creature.error.message);
        return;
    }
}

function getCreatureByID(id: number, creatureMap: Map<Number, ICreature>): Result<ICreature, Error> {
    if (creatureMap.has(id)) return Ok(creatureMap.get(id)!);
    return Err(new Error(`No creature found with id ${id}`));
}

async function createCreature(request: Express.Request, response: Express.Response): Promise<void> {
    const incomingName = request.query.name;
    const incomingType = request.query.type;
    if (typeof incomingName !== 'string' && incomingName !== undefined) {
        response.sendStatus(400);
        console.log(`No name provided or invalid name`);
        return;
    }
    if (typeof incomingType !== 'string' && incomingType !== undefined) {
        response.sendStatus(400);
        console.log(`Invalid type provided`);
        return;
    }
    const creature = generateCreature(globalCreatureMap, incomingName, incomingType);
    if (creature.isErr()) {
        response.sendStatus(400);
        console.log(creature.error.message);
        return;
    }
    response.setHeader("Content-Type", "application/json");
    response.send(JSON.stringify(getCreatureByID(creature.value, globalCreatureMap)));
}

function generateCreature(creatureMap: Map<Number, ICreature>, name?: string, type?: string): Result<number, Error> {
    const newCreature: ICreature = {
        id: getRandomIntInclusive(Number.MAX_SAFE_INTEGER, 100000).unwrap(),
        name: name || getRandomName(),
        type: type || getRandomType(),
        hunger: {
            fullness: 100,
            satiation: 100
        }
    }
    if (creatureMap) {
        creatureMap.set(newCreature.id, newCreature);
    }
    return Ok(newCreature.id);
}

function getRandomIntInclusive(max: number, min = 1): Result<number, Error> {
    if (max > Number.MAX_SAFE_INTEGER || max < 0) {
        return Err(new Error(`maximum integer size exceeded or maximum set to less than zero.`))
    }
    min = Math.ceil(min);
    max = Math.floor(max);
    const range = max - min + 1
    return Ok(Math.floor(Math.random() * range + min));
}

function getRandomName(): string {
    const names = <const>[
        "Bob",
        "Joe",
        "Steve",
        "Bobby",
        "Joey",
        "Steven",
        "Bobby Joe",
        "Joe Bob",
        "Steve Bob",
        "Steve Joe",
        "Steve Bobby",
        "Steve Bob Joe",
        "Steve Joe Bob",
        "Steve Bobby Joe",
        "Steve Bob Joe Bobby",
        "Steve Joe Bob Bobby",
        "Steve Bobby Joe Bob"];
        const num = getRandomIntInclusive(names.length).unwrap();
        const name = names[num];
        if (name === undefined) process.exit(1);
        return name;
}

function getRandomType(): string {
    const speciesArray: ISpecies[] = [
        { speciesName: `turtle` },
        { speciesName: `duck` },
        { speciesName: `turtleduck` },
        { speciesName: `boar` },
        { speciesName: `hound` },
        { speciesName: `boarhound` },
        { speciesName: `chicken` },
        { speciesName: `hawk` },
        { speciesName: `chickenhawk` },
        { speciesName: `squirrel` },
        { speciesName: `eel` },
        { speciesName: `squirreel` },
        { speciesName: `salamander` },
        { speciesName: `firebird` },
        { speciesName: `dragon` },
        { speciesName: `owl` },
        { speciesName: `bat` },
        { speciesName: `owlbat` },
        { speciesName: `rabbit` },
        { speciesName: `deer` },
        { speciesName: `rabbideer` },
        { speciesName: `cat` },
        { speciesName: `fox` },
        { speciesName: `catfox` },
    ]
    const num = getRandomIntInclusive(speciesArray.length).unwrap();
    const species = speciesArray[num];
    if (species === undefined) process.exit(1);
    return species.speciesName;

}