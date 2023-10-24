import { Delay } from '../../../shared/utils/tools';

export const InitTrialsMode = (): void => {
    RegisterCommand(
        'drift',
        (source: number, args: string[]) => {
            if (args.length === 0) return;
            if (args[0] == 'start') return startTrail();
            if (args[0] == 'end') return endTrail();
        },
        false,
    );
};

let points = 0;
let pointsTick: number = null;
let drawTick: number = null;
let vehicle = null;
let lastHealth = 1000
let driftCombo = {
    lastDrift: 0,
    bonus: 1,
    points: 0,
    drfits: 0,
};

const endTrail = (): void => {
    clearTick(pointsTick);
    clearTick(drawTick);
    exports['np-ui'].sendAppEvent('status-hud', {
        show: false,
    });
};

const displayHud = (): void => {
    let pointsString = `Points: ${Math.ceil(points)}`;
    let bonusAmount = 0;
    if (driftCombo.bonus > 1) {
        pointsString += ` (+${driftCombo.points})`;
        bonusAmount = Math.ceil((driftCombo.bonus - 1) * 100);
    }
    exports['np-ui'].sendAppEvent('status-hud', {
        show: true,
        title: 'Drift Trails',
        values: ['Position: 1/1', pointsString, `Current Bonus: ${bonusAmount}%`],
    });
};

const startTrail = (): void => {
    vehicle = GetVehiclePedIsIn(PlayerPedId(), false);
    lastHealth = GetEntityHealth(vehicle);
    
    if (pointsTick) {
        clearTick(pointsTick);
    }
    
    if (drawTick) {
        clearTick(drawTick);
    }

    pointsTick = setTick(async () => {
        const [addedPoints, damage] = calcCarPoints();
        points += addedPoints;
        if (damage > 20 || (driftCombo.lastDrift > 0 && GetGameTimer() > driftCombo.lastDrift + 10000)) {
            driftCombo = {
                lastDrift: 0,
                bonus: 1,
                points: 0,
                drfits: 0,
            };
        } else if (addedPoints > 0 && (driftCombo.lastDrift === 0 || GetGameTimer() > driftCombo.lastDrift + 5000)) {
            driftCombo.lastDrift = GetGameTimer();
            driftCombo.points = Math.floor(driftCombo.points + addedPoints * driftCombo.bonus);
            points = driftCombo.points;
            driftCombo.drfits++;
            if (driftCombo.drfits >= 2) {
                driftCombo.drfits = 0;
                driftCombo.bonus = parseFloat((driftCombo.bonus + 0.1).toFixed(2));
            }
        }
        
        displayHud();
        
        await Delay(150);
    });
};

const calcCarPoints = (): [number, number] => {
    const speed = GetEntitySpeed(vehicle);
    const gear = GetVehicleCurrentGear(vehicle);

    const velocity = GetEntityVelocity(vehicle);

    const healthDiff = Math.max(0, lastHealth - GetEntityHealth(vehicle));
    lastHealth = GetEntityHealth(vehicle);

    const modV = Math.sqrt(velocity[0] * velocity[0] + velocity[1] * velocity[1]);
    const rot = GetEntityRotation(vehicle, 0);
    const sN = -Math.sin(degToRad(rot[2]));
    const cS = Math.sin(degToRad(rot[2]));
    
    if (speed * 3.6 < 40 || gear == 0) {
        return [0, healthDiff];
    }
    
    const cosX = (sN * velocity[0] + cS * velocity[1]) / modV;
    
    if (cosX > 0.9 || cosX < 0) {
        return [0, healthDiff];
    }
    
    return [Math.floor(0.25 * radToDeg(Math.acos(cosX)) * modV) - healthDiff, healthDiff];
};

const degToRad = (degress: number): number => {
    return degress * (Math.PI / 180);
};

const radToDeg = (radians: number): number => {
    return radians * (180 / Math.PI);
};

const drawScreenText = (text: string, x: number, y: number): void => {
    SetTextColour(255, 255, 255, 255);
    SetTextFont(0);
    SetTextScale(0.4, 0.4);
    SetTextWrap(0.0, 1.0);
    SetTextCentre(true);
    SetTextDropShadow(); //0, 0, 0, 0, 255
    SetTextEdge(50, 0, 0, 0, 255);
    SetTextOutline();
    SetTextEntry('STRING');
    AddTextComponentString(text);
    DrawText(x, y);
};