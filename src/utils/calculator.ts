type ItemConfig = {
  cost: number;
  name: string;
  action?: "spend" | "earn";
  eCashbackEarnRatePerBase: number;
  eCashbackSpendRatePerBase: number;
  eCashbackEarnRateBase: number;
  eCashbackSpendRateBase: number;
  cashbackApplied?: number;
};

export class Item implements ItemConfig {
  cost: number;
  name: string;
  action?: "spend" | "earn";
  eCashbackEarnRatePerBase: number;
  eCashbackSpendRatePerBase: number;
  eCashbackEarnRateBase: number;
  eCashbackSpendRateBase: number;
  cashbackApplied?: number;

  constructor(config: ItemConfig) {
    this.cost = config.cost;
    this.name = config.name;
    this.action = config.action;
    this.eCashbackEarnRatePerBase = config.eCashbackEarnRatePerBase;
    this.eCashbackSpendRatePerBase = config.eCashbackSpendRatePerBase;
    this.eCashbackEarnRateBase = config.eCashbackEarnRateBase;
    this.eCashbackSpendRateBase = config.eCashbackSpendRateBase;
  }

  get eCashbackEarned(): number {
    return (
      Math.floor(this.cost / this.eCashbackEarnRateBase) *
      this.eCashbackEarnRatePerBase
    );
  }

  get maxECashbackApplicable(): number {
    return (
      Math.floor(this.cost / this.eCashbackSpendRateBase) *
      this.eCashbackSpendRatePerBase
    );
  }

  clone(): Item {
    return new Item({
      cost: this.cost,
      name: this.name,
      action: this.action,
      eCashbackEarnRatePerBase: this.eCashbackEarnRatePerBase,
      eCashbackSpendRatePerBase: this.eCashbackSpendRatePerBase,
      eCashbackEarnRateBase: this.eCashbackEarnRateBase,
      eCashbackSpendRateBase: this.eCashbackSpendRateBase,
    });
  }

  spendCashback(cashbackApplied: number): Item {
    const cloneItem = this.clone();
    cloneItem.action = "spend";
    cloneItem.cashbackApplied = cashbackApplied;
    return cloneItem;
  }

  earnCashback(): Item {
    const cloneItem = this.clone();
    cloneItem.action = "earn";
    return cloneItem;
  }
}

export class ItemsTracker {
  eCashback: number;
  finalCost: number;
  items: Item[];

  constructor(items: Item[], eCashback: number, totalCost: number) {
    this.items = items;
    this.eCashback = eCashback;
    this.finalCost = totalCost;
  }

  get initialCost(): number {
    return this.items.reduce((acc, curr) => acc + curr.cost, 0);
  }

  addItemSpendCashback(item: Item): ItemsTracker {
    const eCashbackApplicable = Math.min(
      item.maxECashbackApplicable,
      this.eCashback,
    );

    return new ItemsTracker(
      [...this.items, item.spendCashback(eCashbackApplicable)],
      this.eCashback - eCashbackApplicable,
      this.finalCost + item.cost - eCashbackApplicable,
    );
  }

  addItemEarnCashback(item: Item): ItemsTracker {
    return new ItemsTracker(
      [...this.items, item.earnCashback()],
      this.eCashback + item.eCashbackEarned,
      this.finalCost + item.cost,
    );
  }

  clone(): ItemsTracker {
    return new ItemsTracker(this.items, this.eCashback, this.finalCost);
  }

  toString(): string {
    return `ItemsTracker {
      items: ${JSON.stringify(this.items, null, 2)}
      eCashback: ${this.eCashback}
      initialCost: ${this.items.reduce((acc, curr) => acc + curr.cost, 0)}
      finalCost: ${this.finalCost}
    }`;
  }
}

function getLowestSumPossible(
  items: Item[],
  itemsTracker: ItemsTracker,
): ItemsTracker {
  if (items.length === 0) {
    return itemsTracker;
  }

  if (items.length === 1) {
    if (itemsTracker.items.length === 0) {
      return itemsTracker.addItemEarnCashback(items[0]);
    }
    return itemsTracker.addItemSpendCashback(items[0]);
  }

  const firstItemsCheapest: ItemsTracker[] = [];

  for (let i = 0; i < items.length; i++) {
    const firstItem = items[i];
    const remainingItems = items.slice(0, i).concat(items.slice(i + 1));

    const spentCashbackItemsTracker =
      itemsTracker.addItemSpendCashback(firstItem);
    const earnedCashbackItemsTracker =
      itemsTracker.addItemEarnCashback(firstItem);

    const getLowestSumPossibleAfterSpentCashback = getLowestSumPossible(
      remainingItems,
      spentCashbackItemsTracker.clone(),
    );
    const getLowestSumPossibleAfterEarnCashback = getLowestSumPossible(
      remainingItems,
      earnedCashbackItemsTracker.clone(),
    );

    const isSpentCashbackCheaper =
      getLowestSumPossibleAfterSpentCashback.finalCost <
      getLowestSumPossibleAfterEarnCashback.finalCost;

    const cheapestItemTracker = isSpentCashbackCheaper
      ? getLowestSumPossibleAfterSpentCashback
      : getLowestSumPossibleAfterEarnCashback;

    firstItemsCheapest.push(cheapestItemTracker);
  }

  const cheapestItemsTracker = firstItemsCheapest.reduce((acc, curr) => {
    if (acc.finalCost === curr.finalCost) {
      return acc.eCashback > curr.eCashback ? acc : curr;
    }

    return acc.finalCost < curr.finalCost ? acc : curr;
  }, new ItemsTracker([], 0, Number.MAX_SAFE_INTEGER));

  return cheapestItemsTracker;
}

export class AudioHouseCalculator {
  items: Item[];
  itemsTracker: ItemsTracker;

  constructor(items: Item[] = []) {
    this.items = items.map((item) => item.clone());
    this.itemsTracker = new ItemsTracker([], 0, 0);
  }

  calculate(): ItemsTracker {
    return getLowestSumPossible(this.items, this.itemsTracker);
  }
}

// const items = [
//   new Item(300, "Item 3"),
//   new Item(200, "Item 2"),
//   new Item(400, "Item 5"),
//   new Item(100, "Item 1"),
//   new Item(575, "Item 4"),
// ];

// const itemsTracker = new ItemsTracker([], 0, 0);

// const lowestSumPossible = getLowestSumPossible(items, itemsTracker);

// console.log(lowestSumPossible.toString());
