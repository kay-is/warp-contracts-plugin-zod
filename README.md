# SmartWeave Extension for Zod

A Warp SmartWeave extension for the Zod schema validation library.

## Features

- Create Zod schemas with a global `zod` object in contract files.
- Validate contract inputs with Zod schemas.
- Create TypeScript types from Zod schemas.

## Install

    $ yarn add @kay-is/warp-contracts-plugin-zod

## Setup

```ts
import { ZodExtension } from '@kay-is/warp-contracts-plugin-zod';
import { WarpFactory } from 'warp-contracts';

const warp = WarpFactory.forMainnet().use(new ZodExtension());
```

## Usage

```ts
import type { Zod } from '@kay-is/warp-contracts-plugin-zod';

declare global {
  const zod: Zod;
}

// Zod schemas for validation at contract evaluation time

const contractStateSchema = zod.object({
  stringValue: zod.string(),
  numberValue: zod.number()
});

const emptyInputSchema = zod.object({
  function: zod.literal('empty'),
  value: zod.never()
});

const functionAInputSchema = zod.object({
  function: zod.literal('A'),
  value: zod.number()
});

const functionBInputSchema = zod.object({
  function: zod.literal('B'),
  value: zod.string()
});

const actionSchema = z.object({
  caller: z.string(),
  input: zod.discriminatedUnion('function', [emptyInputSchema, functionAInputSchema, functionBInputSchema])
});

// Infer static type for autocmpletion and type safety
type ContractState = Zod.infer<typeof contractStateSchema>;
function handler(state: ContractState, action: unknown): ContractState {
  const { caller, input } = validate(actionSchema, action);
  if (input.function === 'A') {
    return A(state, valiate(functionAInputSchema, input), caller);
  }

  if (input.function === 'B') {
    return B(state, valiate(functionBInputSchema, input), caller);
  }
}

// Infer static type for autocmpletion and type safety
type FunctionAInput = Zod.infer<typeof functionAInputSchema>;
function A(state: ContractState, input: FunctionAInput, caller: string): ContractState {
  return {
    state...,
    numberValue: input.value
  }
}

// Infer static type for autocmpletion and type safety
type FunctionBInput = Zod.infer<typeof functionBInputSchema>;
function B(state: ContractState, input: FunctionBInput, caller: string): ContractState {
  return {
    state...,
    stringValue: input.value
  }
}
```
