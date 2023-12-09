import Express from 'express'
import { ICreature, ISpecies } from './interfaces.js';
import { Result, Ok, Err } from "ts-results-es";
import { EventEmitter } from 'node:events';
const app = Express();

const port = 8080;

const myResponse = {
    port: port
};
let globalCreatureMap = new Map<Number, ICreature>();

app.get("/", (_request, response) => {
    response.send(`Hey, I started a server on ${port}!`);
})

app.get("/api/port", (_request, response) => {
    response.setHeader("Content-Type", "application/json");
    response.send(JSON.stringify(myResponse));
})

app.use(Express.static('html'))
app.use(`/static`, Express.static(`html`))

app.get("/api/getCreature", getCreature);
app.get("/api/createCreature", createCreature);
app.get("/api/CreatureDisplay", (_request, response) => {
    response.send(`http://localhost:${port}/api/static/CreatureDisplay`)
} )

app.listen(port, () => {
    console.log(`Server started on port: http://localhost:${port}`);
    console.log(`generate new creature at: http://localhost:${port}/api/createCreature`)
})

const serverTickEmitter = new EventEmitter()

setInterval(() => {
    serverTickEmitter.emit(`tick`)
    console.log("this is the server tickrate: 1000 ms")
}, 1000)

serverTickEmitter.on('tick', eventHandler)

function eventHandler(): void {
    console.log(serverTickEmitter.listeners('tick'))
    console.log("this is the handler")
}

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
        console.log(`Incoming name must be a string: ${incomingName}`);
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
        console.log(`this is the creature that errored: ${creature.error.message}`);
        return;
    }
    response.setHeader("Content-Type", "application/json");
    response.send(JSON.stringify(getCreatureByID(creature.value, globalCreatureMap)));
}

// const preElement = document.getElementById('json-data');
// preElement.innerHTML = JSON.stringify(getCreatureByID);


function generateCreature(creatureMap: Map<Number, ICreature>, name?: string, type?: string): Result<number, Error> {
    const newCreature: ICreature = {
        id: getRandomIntInclusive(Number.MAX_SAFE_INTEGER, 100000).unwrap(),
        name: name || getRandomName(),
        type: type || getRandomType(),
        hunger: {
            fullness: 100,
            satiation: 100
        },
        hungerHandler: abstractDefaultHungerHandler,
    }
    serverTickEmitter.on('tick', newCreature.hungerHandler.bind(newCreature))
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

//this is a case for this.
function abstractDefaultHungerHandler(this: ICreature) {
    console.log(this.hunger)
    if (this.hunger.satiation > 0) {
        this.hunger.satiation--
        return
    }
    if (this.hunger.fullness > 0) {
        this.hunger.fullness--
    }
}

// async function displayCreature(id : number): Promise <ICreature> {
//     console.log(id)
//     const url = `http://localhost:${port}/api/createCreature`
//     const response = await fetch(url);
//     const result: ICreature = await response.json();
//     return {name: result.name, id: result.id, type: result.type, hunger: result.hunger, hungerHandler: result.hungerHandler};
// }

// console.log(await displayCreature)  