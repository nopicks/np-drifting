export const InitItems = (): void => {};

RPC.register('np-drifting:parts:apply', async (source: number, vin: string, item: string) => {
    await AsyncExports['np-vehicles'].SetVehicleAfterMarket(vin, item, true);
});