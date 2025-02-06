"use client";

import { useState } from "react";
import { AudioHouseCalculator, Item, ItemsTracker } from "@/utils/calculator";

type FormItem = {
  id: string;
  name: string;
  cost: number;
  eCashbackEarnRatePerBase: number | null;
  eCashbackEarnRateBase: number | null;
  eCashbackSpendRatePerBase: number | null;
  eCashbackSpendRateBase: number | null;
};

type GlobalRates = {
  eCashbackEarnRatePerBase: number;
  eCashbackEarnRateBase: number;
  eCashbackSpendRatePerBase: number;
  eCashbackSpendRateBase: number;
};

export default function Home() {
  const [globalRates, setGlobalRates] = useState<GlobalRates>(() => {
    if (typeof window === "undefined")
      return {
        eCashbackEarnRatePerBase: 20,
        eCashbackEarnRateBase: 100,
        eCashbackSpendRatePerBase: 20,
        eCashbackSpendRateBase: 100,
      };

    return JSON.parse(
      localStorage.getItem("globalRates") ||
        JSON.stringify({
          eCashbackEarnRatePerBase: 20,
          eCashbackEarnRateBase: 100,
          eCashbackSpendRatePerBase: 20,
          eCashbackSpendRateBase: 100,
        }),
    );
  });

  const [items, setItems] = useState<FormItem[]>(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(localStorage.getItem("items") || "[]");
  });

  const [result, setResult] = useState<ItemsTracker | null>(null);

  const updateGlobalRate = (field: keyof GlobalRates, value: string) => {
    const newRates = {
      ...globalRates,
      [field]: value === "" ? 1 : Number(value),
    };
    setGlobalRates(newRates);
    localStorage.setItem("globalRates", JSON.stringify(newRates));
  };

  const addItem = () => {
    const newItems = [
      ...items,
      {
        id: Math.random().toString(),
        name: "",
        cost: 0,
        eCashbackEarnRatePerBase: null,
        eCashbackEarnRateBase: null,
        eCashbackSpendRatePerBase: null,
        eCashbackSpendRateBase: null,
      },
    ];
    setItems(newItems);
    localStorage.setItem("items", JSON.stringify(newItems));
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      const newItems = items.filter((item) => item.id !== id);
      setItems(newItems);
      localStorage.setItem("items", JSON.stringify(newItems));
    }
  };

  const updateItem = (
    id: string,
    field: keyof FormItem,
    value: string | number,
  ) => {
    const newItems = items.map((item) =>
      item.id === id
        ? {
            ...item,
            [field]:
              field === "name" ? value : value === "" ? null : Number(value),
          }
        : item,
    );
    setItems(newItems);
    localStorage.setItem("items", JSON.stringify(newItems));
  };

  const calculateLowestSum = () => {
    const formattedItems = items.map((itemData) => {
      const item = new Item({
        name: itemData.name,
        cost: itemData.cost,
        eCashbackEarnRatePerBase:
          itemData.eCashbackEarnRatePerBase ??
          globalRates.eCashbackEarnRatePerBase,
        eCashbackEarnRateBase:
          itemData.eCashbackEarnRateBase ?? globalRates.eCashbackEarnRateBase,
        eCashbackSpendRatePerBase:
          itemData.eCashbackSpendRatePerBase ??
          globalRates.eCashbackSpendRatePerBase,
        eCashbackSpendRateBase:
          itemData.eCashbackSpendRateBase ?? globalRates.eCashbackSpendRateBase,
      });

      return item;
    });

    const calculator = new AudioHouseCalculator(formattedItems);
    const calculationResult = calculator.calculate();
    setResult(calculationResult);
  };

  return (
    <div className="container mx-auto p-4 text-black">
      <h1 className="text-2xl font-bold mb-4">Audio House Calculator</h1>
      <div className="mb-8 p-4 border rounded-lg shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-4">Global Settings</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Earn Rate Per Base
            </label>
            <input
              type="number"
              value={globalRates.eCashbackEarnRatePerBase}
              onChange={(e) =>
                updateGlobalRate("eCashbackEarnRatePerBase", e.target.value)
              }
              className="w-full p-2 border rounded text-black"
              placeholder="20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Earn Rate Base
            </label>
            <input
              type="number"
              value={globalRates.eCashbackEarnRateBase}
              onChange={(e) =>
                updateGlobalRate("eCashbackEarnRateBase", e.target.value)
              }
              className="w-full p-2 border rounded text-black"
              placeholder="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Spend Rate Per Base
            </label>
            <input
              type="number"
              value={globalRates.eCashbackSpendRatePerBase}
              onChange={(e) =>
                updateGlobalRate("eCashbackSpendRatePerBase", e.target.value)
              }
              className="w-full p-2 border rounded text-black"
              placeholder="20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-black">
              Spend Rate Base
            </label>
            <input
              type="number"
              value={globalRates.eCashbackSpendRateBase}
              onChange={(e) =>
                updateGlobalRate("eCashbackSpendRateBase", e.target.value)
              }
              className="w-full p-2 border rounded text-black"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 border rounded-lg shadow-sm bg-white space-y-4"
          >
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Name
                </label>
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateItem(item.id, "name", e.target.value)}
                  className="w-full p-2 border rounded text-black"
                  placeholder="Item name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Cost
                </label>
                <input
                  type="number"
                  value={item.cost}
                  onChange={(e) => updateItem(item.id, "cost", e.target.value)}
                  className="w-full p-2 border rounded text-black"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Earn Rate Per Base
                </label>
                <input
                  type="number"
                  value={item.eCashbackEarnRatePerBase ?? ""}
                  onChange={(e) =>
                    updateItem(
                      item.id,
                      "eCashbackEarnRatePerBase",
                      e.target.value,
                    )
                  }
                  className="w-full p-2 border rounded text-black"
                  placeholder="$20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Earn Rate Base
                </label>
                <input
                  type="number"
                  value={item.eCashbackEarnRateBase ?? ""}
                  onChange={(e) =>
                    updateItem(item.id, "eCashbackEarnRateBase", e.target.value)
                  }
                  className="w-full p-2 border rounded text-black"
                  placeholder="$100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Spend Rate Per Base
                </label>
                <input
                  type="number"
                  value={item.eCashbackSpendRatePerBase ?? ""}
                  onChange={(e) =>
                    updateItem(
                      item.id,
                      "eCashbackSpendRatePerBase",
                      e.target.value,
                    )
                  }
                  className="w-full p-2 border rounded text-black"
                  placeholder="$20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-black">
                  Spend Rate Base
                </label>
                <input
                  type="number"
                  value={item.eCashbackSpendRateBase ?? ""}
                  onChange={(e) =>
                    updateItem(
                      item.id,
                      "eCashbackSpendRateBase",
                      e.target.value,
                    )
                  }
                  className="w-full p-2 border rounded text-black"
                  placeholder="$100"
                />
              </div>
            </div>
            {items.length > 1 && (
              <button
                onClick={() => removeItem(item.id)}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove Item
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 space-x-4">
        <button
          onClick={addItem}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          Add Item
        </button>
        <button
          onClick={calculateLowestSum}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Calculate Lowest Sum
        </button>
      </div>

      {result && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">Calculation Results</h3>

          <div className="overflow-x-auto">
            <table className="min-w-full table-auto border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border">Name</th>
                  <th className="px-4 py-2 text-left border">Action</th>
                  <th className="px-4 py-2 text-right border">Cost</th>
                </tr>
              </thead>
              <tbody>
                {result.items.map((item: Item, index: number) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 border">{item.name}</td>
                    <td className="px-4 py-2 border">
                      <span
                        className={`inline-block px-2 py-1 rounded text-sm ${
                          item.action === "earn"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {item.action === "earn"
                          ? `Earn Cashback: $${item.eCashbackEarned}`
                          : `Spend Cashback: $${item.cashbackApplied}`}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right border">
                      ${item.cost}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600">Initial Cost</div>
              <div className="text-xl font-semibold">${result.initialCost}</div>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600">Final Cost</div>
              <div className="text-xl font-semibold text-green-600">
                ${result.finalCost}
              </div>
            </div>
            <div className="p-4 bg-white rounded-lg border">
              <div className="text-sm text-gray-600">E-Cashback Left</div>
              <div className="text-xl font-semibold">${result.eCashback}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
