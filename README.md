# SmartWeave Extension for Zod

A Warp plugin that extends the global `SmartWeave` object with Zod parsers
created from custom Zod schemas.

## Features

- Use Zod schemas to validate contract inputs.
- Infer TypeScript types from your Zod schemas for auto-completion in your
  contract and frontend code.
- Parse inputs inside your contract via the global `SmartWeave` object.
- Get `ContractError` if the input is invalid.
- Save space in your contract code by moving the schema definitions to a
  separate file and moving Zod to a plugin.

## Install

    $ npm i @kay-is/warp-contracts-plugin-zod

or

    $ yarn add @kay-is/warp-contracts-plugin-zod

## Schemas and Types Setup

Define your Zod schemas in a separate file.

```ts
// types.ts
import { z } from 'zod';
import { arweaveAddr, arweaveTxId, SmartweaveExtensionZod, ParsedSchemas } from '@kay-is/warp-contracts-plugin-zod';

// Define schemas with Zod
const comment = z.object({
  id: arweaveTxId,
  user: arweaveAddr,
  text: z.string()
});

const addCommentInput = z.object({
  function: z.literal('addComment'),
  user: arweaveAddr,
  text: z.string()
});

// Export the schemas so the extension can inject them into the contract at evaluation time.
export const schemas = {
  comment,
  addCommentInput
};

// Get types of the schemas for the global SmartWeave object
export type Schemas = typeof schemas;
export type SmartWeaveExtensionZodWithSchemas = SmartWeaveExtensionZod<Schemas>;

// Create basic contract types
export type State = {
  comments: Comment[];
};

export type Action = {
  caller: arweaveAddr;
  input: unknown;
};

export type HandlerResult = { state: State } | { result: any };

export type ContractCoreTypes = {
  state: State;
  action: Action;
  handlerResult: HandlerResult;
};

// Merge the schema return types with the contract types
export type ContractTypes = ContractCoreTypes & ParsedSchemas<Schemas>;
```

## Usage Inside a Contract

In the contract file, you can import the `SmartWeaveExtensionZod` type to get
auto-completion for the parser functions.

> **Note:** Import the `types.ts` file with `import type` to avoid importing the schema code!

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
  const { parse } = SmartWeave.extension.zod;

  if (input.function === 'addComment') {
    const addCommentInput = parse.addCommentInput(action.input);
    // addCommentInput has type { function: 'addComment', user: string, text: string }
    return addComment(state, addCommentInput, action.caller);
  }

  // ...
}

function addComment(
  state: ContractTypes['state'],
  input: ContractTypes['addCommentInput'],
  caller: string
): ContractTypes['handlerResult'] {
  // ...
}
```

## Usage Inside a Frontend

Import the your `types.ts` file into your frontend code to get the same
types and schemas as in your contract code.

Create the contract with the `ZodExtension` class to load the schemas into the
extension.

> **Note:** Import the `types.ts` file with `import` to get the schemas in the frontend!

```ts
// frontend.ts
import { WarpFactory } from 'warp-contracts';
import { ZodExtension } from '@kay-is/warp-contracts-plugin-zod';
import { ContractTypes, schemas } from './types';

const warpFactory = WarpFactory.forMainnet().use(new ZodExtension(schemas));
const contract = warpFactory.contract<ContractTypes['state']>('<CONTRACT_ID>');
const result = await contract.readState();

export function App() {
  const [state, setState] = React.useState<ContractTypes['state']>(result.cachedValue.state);

  const addComment = async () => {
    // Throws a Zod validation error if the input is invalid
    // returns the parsed input with the right type if it's valid
    const input = schemas.addUserInput.parse({
      function: 'addComment',
      user: "X".repeat(43),
      text: 'Hello World!'
    });

    await contract.connect(<JWK>).writeInteraction(input);
    const result = await contract.readState();

    setState(result.cachedValue.state);
  }

  return (
    <div>
      <button onClick={addComment} >Create User</button>
      <pre>{JSON.stringify(state, null, 2)}</pre>
    </div>
  );
}
```
