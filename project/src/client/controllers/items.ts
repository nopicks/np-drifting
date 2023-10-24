import { loadAnimDict, progressBar } from "../utils";
import { triggerDriftMode } from "./modes";

export const InitItems = (): void => {}; 


const driftParts = ['driftanglekit', 'driftcoilovers', 'driftdiff', 'drifttires', 'drifthandbrake'];

on('baseevents:enteredVehicle', (vehicle: number, seat: number) => {
    if (seat !== -1) return;

    const aftermarkets = exports['np-vehicles'].GetVehicleAfterMarket(vehicle);
    const partsInstalled = partsRemaining(aftermarkets);
    
    if (partsInstalled === driftParts.length) {
        console.log('drift mode ready');
        return emit('np-ui:loadDriftMode', vehicle);
    }
    
    console.log('neh eh');
    
    toggleDriftModeIcon(vehicle);
});

on('baseevents:leftVehicle', () => {
    emit('np-drifting:showDriftMode', false);
    triggerDriftMode(false);
});

onNet('vehicle:swapSeat', (seat: number) => {
    if (seat !== -1) {
        emit('np-drifting:showDriftMode', false);
        triggerDriftMode(false);
        return;
    }
    const vehicle = GetVehiclePedIsIn(PlayerPedId(), false);
    toggleDriftModeIcon(vehicle);
});

const toggleDriftModeIcon = (vehicle: number): void => {
    if (checkForDriftMode(vehicle)) {
        return emit('np-drifting:showDriftMode', false);
    }
};

export const checkForDriftMode = (vehicle: number): boolean => {
    const aftermarkets = exports['np-vehicles'].GetVehicleAfterMarket(vehicle);
    const partsInstalled = partsRemaining(aftermarkets);
    return partsInstalled === driftParts.length;
};

on('np-inventory:itemUsed', async (name: string): Promise<void> => {
    if (!driftParts.includes(name)) return;

    const coords = GetEntityCoords(PlayerPedId(), true);
    const vehicle = GetClosestVehicle(coords[0], coords[1], coords[2], 3.0, 0, 70);
    
    console.log(vehicle);
    
    if (!vehicle || !DoesEntityExist(vehicle)) {
        return emit('DoLongHudText', 'No vehicle nearby', 2);
    }
    
    const isFWD = GetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fDriveBiasFront') > 0.6;
    if (isFWD) {
        return emit('DoLongHudText', 'Front wheel cars do not accept these parts.', 2);
    }
    
    const vin = exports['np-vehicles'].GetVehicleIdentifier(vehicle);
    if (!vin) return emit('DoLongHudText', 'You cannot install the mods on this vehicle', 2);

    const [canApplyPart] = await RPC.execute('IsEmployedAtBusiness', {
        character: {
            id: exports['isPed'].isPed('cid'),
        },
        business: {
            id: 'hayes_autos',
        },
        distCheck: true,
        coords: { x: coords[0], y: coords[1], z: coords[2] },
    });
    if (!canApplyPart) {
        return emit('DoLongHudText', 'You are not able to apply this part', 2);
    }

    const aftermarkets = exports['np-vehicles'].GetVehicleAfterMarket(vehicle);

    if (aftermarkets && aftermarkets[name]) {
        return emit('DoLongHudText', 'This vehicle already has this part', 2);
    }
    
    await loadAnimDict('mini@repair');
    
    TaskPlayAnim(PlayerPedId(), 'mini@repair', 'fixing_a_ped', 8.0, -8.0, -1, 1, 1.0, false, false, false);
    
    const success = await progressBar(30000, 'Installing part...');

    ClearPedTasks(PlayerPedId());

    if (success !== 100) return;

    await RPC.execute('np-drifting:parts:apply', vin, name);

    const installedParts = partsRemaining(aftermarkets);
    
    emit('inventory:removeItem', name, 1);
    
    if (installedParts + 1 == driftParts.length) {
        return emit('DoLongHudText', 'Part installed! Time to drift!');
    }
    
    return emit('DoLongHudText', `part installed! ${driftParts.length - installedParts + 1} parts remaining`);
});

const partsRemaining = (aftermarkets: { [key: string]: unknown }): number => {
    let installed = 0;
    
    for (const part of driftParts) {
        if (aftermarkets && aftermarkets[part]) {
            installed++
        }
    }
    
    return installed;
};