import BigNumber from "bignumber.js";
import getEstimatedFees from "./getFeesForTransaction";
import {
  fixtureChainSpec,
  fixtureTransactionParams,
  fixtureTxMaterialWithMetadata,
} from "../network/sidecar.fixture";
import { createFixtureAccount, createFixtureTransaction } from "../types/bridge.fixture";
import { createRegistryAndExtrinsics } from "../network/common";

const mockPaymentInfo = jest.fn();
const mockRegistry = jest
  .fn()
  .mockResolvedValue(createRegistryAndExtrinsics(fixtureTxMaterialWithMetadata, fixtureChainSpec));
const mockTransactionParams = jest.fn().mockResolvedValue(fixtureTransactionParams);
jest.mock("../network/sidecar", () => ({
  getRegistry: () => mockRegistry(),
  paymentInfo: (args: any) => mockPaymentInfo(args),
  getTransactionParams: () => mockTransactionParams(),
}));

describe("getEstimatedFees", () => {
  const transaction = createFixtureTransaction();

  beforeEach(() => {
    mockPaymentInfo.mockClear();
  });

  it("returns estimation from Polkadot explorer", async () => {
    // Given
    const account = createFixtureAccount();
    const partialFee = "155099812";
    mockPaymentInfo.mockResolvedValue({
      weight: "WHATEVER",
      class: "WHATEVER",
      partialFee,
    });

    // When
    const result = await getEstimatedFees({
      a: account,
      t: transaction,
    });

    // Then
    expect(mockPaymentInfo).toHaveBeenCalledTimes(1);
    // Receive hex signature computed by Polkadot lib
    expect(mockPaymentInfo.mock.lastCall).not.toBeNull();
    expect(result).toEqual(new BigNumber(partialFee));
  });
});
