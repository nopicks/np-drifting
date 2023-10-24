import { Delay } from '../../shared/utils/tools';

let driftTick = null;

export const InitDrift = (): void => {
    if (driftTick) clearTick(driftTick);

    driftTick = setTick(async () => {
        const ped = PlayerPedId();
        const vehicle = GetVehiclePedIsIn(ped, false);
        const seatPed = GetPedInVehicleSeat(vehicle, -1);
        
        if (seatPed !== ped) return await Delay(100);
        
        console.log('car YEP');

        await Delay(100);
    });
};