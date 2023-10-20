# SmartWeave Extension for Zod

A Warp plugin that extends the global `SmartWeave` object with a Zod parser.

## Features

- Use Zod schemas to validate contract inputs
- Infer TypeScript types from your Zod schemas for auto-complete in your
  contract code
- Parse inputs inside your contract via the global `SmartWeave` object
- Throws a `ContractError` if the input is invalid
- Doesn't include the Zod library into your contract code

## Install

    $ npm i @kay-is/warp-contracts-plugin-zod

or

    $ yarn add @kay-is/warp-contracts-plugin-zod

## Schemas and Types Setup

Define your Zod schemas in a separate file. They will be available in your
contract via

    SmartWeave.extensions.zod.parse.<SCHEMA>(input: unknown, errorMsg?: string)

```ts
// types.ts
import { z } from 'zod';
import { arweaveAddr, arweaveTxId, SmartweaveExtensionZod, ParsedSchemas } from '@kay-is/warp-contracts-plugin-zod/types';

// Define schemas with Zod
const user = z.object({
  id: arweaveAddr,
  name: z.string(),
  age: z.number().optional()
});

const comment = z.object({
  id: arweaveTxId,
  user: arweaveAddr,
  text: z.string()
});

const addUserInput = z.object({
  function: z.literal('addUser'),
  name: z.string(),
  age: z.number().optional()
});

const addCommentInput = z.object({
  function: z.literal('addComment'),
  user: arweaveAddr,
  text: z.string()
});

const input = z.discriminatedUnion('function', [addUserInput, addCommentInput]);

// Export the schemas so the extension can inject them into the contract at evaluation time.
export const schemas = {
  user,
  comment,
  addUserInput,
  addCommentInput
  input,
};

// Get types of the schemas for the global SmartWeave object
export type Schemas = typeof schemas;
export type SmartWeaveExtensionZodWithSchemas = SmartWeaveExtensionZod<Schemas>

// Create basic contract types
export type State = {
  users: User[];
  comments: Comment[];
};

export type Action = {
  caller: arweaveAddr;
  input: unknown;
}

export type HandlerResult = { state: State } | { result: any };

export type ContractCoreTypes = {
  state: State;
  action: Action;
  handlerResult: HandlerResult;
};

// Merge the parsed schema types with the contract types
export type ContractTypes = ContractCoreTypes & ParsedSchemas<Schemas>;
```

## Usage Inside a Contract

In the contract file, you can import the `SmartWeaveExtensionZod` type to get
auto-complete for the extension methods.

Import the `types.ts` file with `import type` to avoid importing the schema code.

```ts
// contract.ts
import type { SmartWeaveGlobal } from 'smartweave/lib/smartweave-global';
import type { ContractTypes, Schemas, SmartWeaveExtensionZodWithSchemas } from './types';

// Merge the standard SmartWeave types with the extenion type that includes the
// schema types for auto-completion.
declare global {
  const SmartWeave: SmartWeaveGlobal & SmartWeaveExtensionZodWithSchemas;
}

export function handle(state: ContractTypes['state'], action: ContractTypes['action']): ContractTypes['handlerResult'] {
  const { zod } = SmartWeave.extension;

  // action.caller has type string
  // action.input has type unknown

  // Throws a ContractError if the action is invalid
  const { caller, input } = zod.parse.action(action);

  // input now has type { function: 'addUser', ... } | { function: 'addComment', ... }

  if (input.function === 'addUser') {
    const addUserInput = zod.parse.addUserInput(input);
    // addUserInput now has type { function: 'addUser', name: string, age?: number }

    return addUser(state, addUserInput, caller);
  }

  if (input.function === 'addComment') {
    const addCommentInput = zod.parse.addCommentInput(input);
    // addCommentInput now has type { function: 'addComment', user: string, text: string }

    return addComment(state, addCommentInput, caller);
  }

  // ...
}

function addUser(
  state: ContractState,
  input: ContractTypes['addUserInput'],
  caller: string
): ContractTypes['handlerResult'] {
  // ...
}

function addComment(
  state: ContractState,
  input: ContractTypes['addCommentInput'],
  caller: string
): ContractTypes['handlerResult'] {
  // ...
}
```

## Usage Inside a Frontend

Create the contract with the `ZodExtension` class to load the schemas into the
extension.

Import the your `types.ts` file into your frontend code to get the same
types and schemas as in your contract code.

```ts
// frontend.ts
import { WarpFactory } from 'warp-contracts';
import { ContractTypes, schemas } from './types';

const warpFactory = WarpFactory.forMainnet().use(new ZodExtension(schemas));
const contract = warpFactory.contract<ContractTypes['state']>('<CONTRACT_ID>');

export function App() {
  const [state, setState] = React.useState<ContractTypes['state']>();

  React.useEffect(async () => {
    const result = await contract.readState();
    // result result.cachedValue.state has type ContractTypes['state']
    setState(result.cachedValue.state);
  }, []);


  const addUser = async () => {
    // throws a Zod validation error if the input is invalid
    // returns the parsed input with the right type if it's valid
    const input: ContractTypes['addUserInput'] = schemas.addUserInput.parse({
      function: 'addUser',
      name: 'John Doe',
      age: 42
    });

    await contract.connect(jwk).writeInteraction(input, { strict: true });

    const result = await contract.readState();
    setState(result.cachedValue.state);
  }

  return (
    <div>
      <button onClick={addUser} >Create User</button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
```
