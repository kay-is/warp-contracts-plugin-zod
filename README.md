# SmartWeave Extension for Zod

A plugin for Warp Contracts that allows using Zod verifications inside a contract.

## Install

    $ yarn add warp-contracts-plugin-nlp

## Setup

```ts
import { ZodExtension } from '@kay-is/warp-contracts-plugin-zod';
import { WarpFactory } from 'warp-contracts';

const warp = WarpFactory.forMainnet().use(new ZodExtension());
```

## Usage

```ts
const User = SmartWeave.extensions.zod.object({
  username: z.string()
});

User.parse({ username: 'Ludwig' });

// extract the inferred type
type User = SmartWeave.extensions.zod.infer<typeof User>;
```
