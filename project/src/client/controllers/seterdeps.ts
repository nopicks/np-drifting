export const InitSeter = (): void => {}; 

interface AfterMarketEntry {
    name: string;
    price: number;
    id: number;
}

interface VehicleAfterMarkets {
    [key: string]: AfterMarketEntry;
}

interface MetaDataEntry {
    [key: string]: any;
}

export abstract class Seter {
    
    static GetStateBag(pVehicle: number, pKey?: string): any {
        return GetStateBagValue(String(pVehicle), pKey);
    }

    static GetVehicleMetadata(pVehicle: number | string, pVariable?: MetaDataEntry | string): any {
        let bag;

        if (typeof pVehicle == 'number') {
            bag = Seter.GetStateBag(pVehicle);
        }
        
        if (!bag) return;

        return pVariable ? (bag.state?.data ? pVariable : null) : bag.state?.data;
    }

    static GetVehicleAfterMarket(pVehicle: number, pAfterMarket?: AfterMarketEntry): number | VehicleAfterMarkets {
        return pAfterMarket ? Seter.GetVehicleMetadata(pVehicle, 'afterMarkets') : Seter.GetVehicleMetadata(pVehicle, 'afterMarkets');
    }

    static GetVehicleIdentifier(pVehicle: number): string {
        const stateBag = Seter.GetStateBag(pVehicle);
        return stateBag.state?.vin;
    }
}
