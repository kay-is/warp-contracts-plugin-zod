# SmartWeave Extension for Zod

A plugin for Warp Contracts that allows using Zod verifications inside a contract.

## Install

    $ yarn add warp-contracts-plugin-zod

## Setup

```ts
import { ZodExtension } from '@kay-is/warp-contracts-plugin-zod';
import { WarpFactory } from 'warp-contracts';

const warp = WarpFactory.forMainnet().use(new ZodExtension());
```

## Usage

Runtime validation:

```ts
import type { Zod } from '@kay-is/warp-contracts-plugin-zod';

declare global {
  const SmartWeave: {
    extensions: {
      zod: Zod;
    };
  };
}

const { zod } = SmartWeave.extensions;
const User = zod.object({
  username: zod.string()
});

User.parse({ username: 'Ludwig' });
```

Compile-time validation:

```ts
import type { Zod } from '@kay-is/warp-contracts-plugin-zod';

const { zod } = SmartWeave.extensions;
const User = zod.object({
  username: zod.string()
});

type User = Zod.infer<typeof User>;
```
