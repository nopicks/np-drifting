
import { GetResourceConfig } from '../../shared/config';
import { Delay } from '../../shared/utils/tools';
import { progressBar } from "../utils";
import { checkForDriftMode } from './items';

let driftMode = false;
const stockValues: { [key: string]: number } = {};
let speedCheck: number = null;

// setImmediate(() => {
//     Object.keys(GetResourceConfig<DriftingConfig>().handling).forEach((key) => {
//         stockValues[key] = 0;
//     });
// });

// const getConfig = (): DriftingConfig => {
//     return GetResourceConfig<DriftingConfig>();
// }; 

const getDefaultValues = async (vehicle: number): Promise<void> => {
    stockValues.fInitialDriveForce = GetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fInitialDriveForce');
    stockValues.fSteeringLock = GetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fSteeringLock');
    stockValues.fTractionCurveMax = GetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fTractionCurveMax');
    stockValues.fTractionCurveMin = GetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fTractionCurveMin');
    stockValues.fTractionCurveLateral = GetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fTractionCurveLateral');
    stockValues.fLowSpeedTractionLossMult = GetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fLowSpeedTractionLossMult');
    stockValues.fCamberStiffness = GetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fCamberStiffness');
};

const setDriftValues = async (vehicle: number): Promise<void> => {
    const driveBias = GetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fDriveBiasFront');
    const isAWD = driveBias > 0.4 && driveBias < 0.6;

    SetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fInitialDriveForce', stockValues.fInitialDriveForce * 3);
    SetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fSteeringLock', stockValues.fSteeringLock * (isAWD ? 2 : 2.5));
    SetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fTractionCurveMax', isAWD ? 1.35 : 1.45);
    SetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fTractionCurveMin', isAWD ? 1.3 : 1.4);
    SetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fTractionCurveLateral', isAWD ? 25 : 30);
    SetVehicleHandlingFloat(
        vehicle,
        'CHandlingData',
        'fLowSpeedTractionLossMult',
        stockValues.fInitialDriveForce / (isAWD ? 3 : 4),
    );
    SetVehicleHandlingFloat(vehicle, 'CHandlingData', 'fCamberStiffness', 1);

    // if (speedCheck) clearTick(speedCheck);
    // initSpeedCheck();

    SetEntityMaxSpeed(vehicle, 160 * 2.236936);
};

const resetValues = (vehicle: number): void => {
    if (speedCheck) {
        clearTick(speedCheck);
    }
    for (const handlingFloat in stockValues) {
        SetVehicleHandlingFloat(vehicle, 'CHandlingData', handlingFloat, stockValues[handlingFloat]);
        stockValues[handlingFloat] = 0;
    }
};

const initSpeedCheck = (): void => {
    speedCheck = setTick(async () => {
        const speed = GetEntitySpeed(GetVehiclePedIsIn(PlayerPedId(), false));
    });
};

export const triggerDriftMode = (toggle: boolean): void => {
    driftMode = toggle;
    emit('np-drifting:toggleDriftMode', driftMode);
    emit('DoLongHudText', `Drift Mode ${driftMode ? 'activated' : 'disabled'}`);
};

export const InitModes = (): void => {}; 

const toggleDriftMode = async (): Promise<void> => {
    const vehicle = GetVehiclePedIsIn(PlayerPedId(), false);
    if (!vehicle) return;
    const seat = GetPedInVehicleSeat(vehicle, -1);
    if (seat !== PlayerPedId()) return;

    const hasDriftMode = checkForDriftMode(vehicle);
    if (!hasDriftMode) return;

    await progressBar(30000, 'Toggling drift mode', true);

    triggerDriftMode(!driftMode);
    if (driftMode) {
        await getDefaultValues(vehicle);
        setDriftValues(vehicle);
    } else {
        resetValues(vehicle);
    }
};